<?php
/**
 * Plugin Name: KindPixels PDF Gallery Pro
 * Plugin URI: https://kindpixels.com/plugins/kindpixels-pdf-gallery/
 * Description: Pro addon for KindPixels PDF Gallery - Unlocks unlimited galleries, multi-file upload, and priority support.
 * Version: 2.4.0
 * Author: KIND PIXELS
 * Author URI: https://kindpixels.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: kindpixels-pdf-gallery-pro
 * Requires at least: 5.8
 * Tested up to: 6.9
 * Requires Plugins: kindpixels-pdf-gallery
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Prevent double-loading
if ( defined( 'KINDPDFG_PRO_LOADED' ) ) {
    return;
}
define( 'KINDPDFG_PRO_LOADED', true );
define( 'KINDPDFG_PRO_VERSION', '2.4.0' );

/**
 * Check if the free version is active
 */
function kindpdfg_pro_is_free_active() {
    return defined( 'KINDPDFG_PLUGIN_LOADED' ) || is_plugin_active( 'kindpixels-pdf-gallery/kindpixels-pdf-gallery.php' );
}

/**
 * Admin notice if free version is not installed
 */
function kindpdfg_pro_missing_free_notice() {
    if ( kindpdfg_pro_is_free_active() ) {
        return;
    }
    ?>
    <div class="notice notice-error">
        <p>
            <strong>KindPixels PDF Gallery Pro</strong> requires the free version of 
            <strong>KindPixels PDF Gallery</strong> to be installed and activated.
            <a href="<?php echo esc_url( admin_url( 'plugin-install.php?s=kindpixels+pdf+gallery&tab=search&type=term' ) ); ?>">
                Install it now
            </a>
        </p>
    </div>
    <?php
}
add_action( 'admin_notices', 'kindpdfg_pro_missing_free_notice' );

/**
 * Initialize Freemius SDK for Pro addon (as add-on to main plugin)
 * 
 * IMPORTANT SETUP STEPS:
 * 1. In Freemius Dashboard, go to your main plugin (kindpixels-pdf-gallery)
 * 2. Click "Add-ons" tab, then "Add New Add-on"
 * 3. Create the add-on with slug "kindpixels-pdf-gallery-pro"
 * 4. Copy the Add-on ID and Public Key from Freemius
 * 5. Replace the values below with your actual Add-on ID and Public Key
 * 6. The Parent ID should be your main plugin's Freemius ID
 */
if ( ! function_exists( 'kindpdfg_pro_fs' ) ) {
    function kindpdfg_pro_fs() {
        global $kindpdfg_pro_fs_instance;

        if ( ! isset( $kindpdfg_pro_fs_instance ) ) {
            // Try multiple possible SDK locations
            $paths = array(
                dirname( __FILE__ ) . '/freemius/start.php',
                dirname( __FILE__ ) . '/vendor/freemius/start.php',
            );

            $sdk_loaded = false;
            foreach ( $paths as $sdk_path ) {
                if ( file_exists( $sdk_path ) ) {
                    require_once $sdk_path;
                    $sdk_loaded = true;
                    break;
                }
            }

            if ( $sdk_loaded && function_exists( 'fs_dynamic_init' ) ) {
                $kindpdfg_pro_fs_instance = fs_dynamic_init( array(
                    // ========================================
                    // REPLACE THESE VALUES FROM FREEMIUS:
                    // ========================================
                    'id'                => '00000',                    // Your Add-on ID from Freemius
                    'parent_id'         => '20815',                    // Your Main Plugin ID from Freemius
                    'public_key'        => 'pk_YOUR_ADDON_KEY_HERE',   // Your Add-on Public Key
                    // ========================================
                    
                    'slug'              => 'kindpixels-pdf-gallery-pro',
                    'type'              => 'plugin',
                    'is_premium'        => true,
                    'is_premium_only'   => true,
                    'has_paid_plans'    => true,
                    'is_org_compliant'  => false,
                    'parent'            => array(
                        'id'   => '20815',  // Same as parent_id above
                        'slug' => 'kindpixels-pdf-gallery',
                        'name' => 'KindPixels PDF Gallery',
                    ),
                    'menu'              => array(
                        'slug'    => 'kindpixels-pdf-gallery',
                        'account' => false,
                        'support' => false,
                    ),
                ) );

                // Set basename for proper linkage
                if ( is_object( $kindpdfg_pro_fs_instance ) && method_exists( $kindpdfg_pro_fs_instance, 'set_basename' ) ) {
                    $kindpdfg_pro_fs_instance->set_basename( false, __FILE__ );
                }
            } else {
                // SDK not installed - return dummy object
                $kindpdfg_pro_fs_instance = new stdClass();
            }
        }

        return $kindpdfg_pro_fs_instance;
    }

    // Init Freemius after plugins loaded (to ensure free version is loaded first)
    add_action( 'plugins_loaded', function() {
        if ( kindpdfg_pro_is_free_active() ) {
            kindpdfg_pro_fs();
            do_action( 'kindpdfg_pro_fs_loaded' );
        }
    }, 15 );
}

/**
 * Check if Pro license is valid
 */
function kindpdfg_pro_is_licensed() {
    if ( ! function_exists( 'kindpdfg_pro_fs' ) ) {
        return false;
    }

    $fs = kindpdfg_pro_fs();

    if ( ! is_object( $fs ) ) {
        return false;
    }

    // Check various Freemius methods for license validation
    if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
        return true;
    }
    if ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) {
        return true;
    }
    if ( method_exists( $fs, 'is_plan' ) && $fs->is_plan( 'professional', true ) ) {
        return true;
    }
    if ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) {
        return true;
    }

    return false;
}

/**
 * Override the free version's license status when Pro is active and licensed
 */
add_filter( 'kindpdfg_is_pro', function( $is_pro ) {
    if ( kindpdfg_pro_is_licensed() ) {
        return true;
    }
    return $is_pro;
}, 20 );

/**
 * Add Pro status to the localized script data
 */
add_filter( 'kindpdfg_localize_data', function( $data ) {
    if ( kindpdfg_pro_is_licensed() ) {
        $data['fsIsPro'] = true;
        $data['fsStatus'] = 'pro';
        
        // Get licensed user info from Pro addon
        $fs = kindpdfg_pro_fs();
        if ( is_object( $fs ) && method_exists( $fs, 'get_user' ) ) {
            $user = $fs->get_user();
            if ( is_object( $user ) ) {
                if ( isset( $user->email ) ) {
                    $data['licensedTo'] = $user->email;
                } elseif ( isset( $user->first ) || isset( $user->last ) ) {
                    $data['licensedTo'] = trim( ( isset( $user->first ) ? $user->first : '' ) . ' ' . ( isset( $user->last ) ? $user->last : '' ) );
                }
            }
        }
    }
    return $data;
}, 20 );

/**
 * Deactivation hook - clean up if needed
 */
register_deactivation_hook( __FILE__, function() {
    // Optionally clear Pro-specific transients or options
    delete_transient( 'kindpdfg_pro_license_check' );
} );

/**
 * Plugin action links
 */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function( $links ) {
    $settings_link = '<a href="' . admin_url( 'admin.php?page=kindpixels-pdf-gallery' ) . '">Settings</a>';
    array_unshift( $links, $settings_link );
    return $links;
} );
