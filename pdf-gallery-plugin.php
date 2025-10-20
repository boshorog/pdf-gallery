<?php
/**
 * Plugin Name: PDF Gallery
 * Plugin URI: https://kindpixels.com
 * Description: Create visually stunning galleries from PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, and image files. Easily organize, sort, and showcase your documents in beautiful grid layouts.
 * Version: 1.6.3
 * Author: KIND PIXELS
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Network: false
 */
// Freemius SDK Initialization
if ( ! function_exists( 'pdfgallery_fs' ) ) {
    function pdfgallery_fs() {
        global $pdfgallery_fs;

        if ( ! isset( $pdfgallery_fs ) ) {
            $sdk_path = dirname(__FILE__) . '/vendor/freemius/start.php';
            
            // If SDK exists, initialize it
            if ( file_exists( $sdk_path ) ) {
                require_once $sdk_path;
                
                if ( function_exists( 'fs_dynamic_init' ) ) {
                    $pdfgallery_fs = fs_dynamic_init( array(
                        'id'                  => '20814',
                        'slug'                => 'pdf-gallery',
                        'premium_slug'        => 'pdf-gallery-pro',
                        'type'                => 'plugin',
                        'public_key'          => 'pk_349523fbf9f410023e4e5a4faa9b8',
                        'is_premium'          => false,
                        'has_addons'          => false,
                        'has_paid_plans'      => true,
                        'anonymous_mode'      => true,
                        'opt_in_moderation'   => array(
                            'new'      => 0,
                            'updates'  => 0,
                            'localhost'=> false,
                        ),
                        'menu'                => array(
                            'slug'           => 'pdf-gallery-manager',
                            'account'        => true,
                            'support'        => false,
                        ),
                    ) );
                } else {
                    // SDK file exists but function not available
                    $pdfgallery_fs = new stdClass();
                }
            } else {
                // SDK not installed, return stub
                $pdfgallery_fs = new stdClass();
            }
        }

        return $pdfgallery_fs;
    }

    // Init Freemius
    pdfgallery_fs();
    
    do_action( 'pdfgallery_fs_loaded' );
}

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Prevent double-loading within this request
if (defined('PDF_GALLERY_PLUGIN_LOADED')) {
    return;
}
define('PDF_GALLERY_PLUGIN_LOADED', true);

class PDF_Gallery_Plugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_shortcode('pdf_gallery', array($this, 'display_gallery_shortcode'));
        
        // AJAX handlers
        add_action('wp_ajax_pdf_gallery_action', array($this, 'handle_pdf_gallery_ajax'));
        add_action('wp_ajax_nopriv_pdf_gallery_action', array($this, 'handle_pdf_gallery_ajax'));
        add_action('wp_ajax_pdf_gallery_upload_image', array($this, 'handle_pdf_gallery_upload_image'));
        add_action('wp_ajax_pdf_gallery_freemius_check', array($this, 'handle_freemius_check'));
        add_action('wp_ajax_pdf_gallery_freemius_activate', array($this, 'handle_freemius_activate'));
        add_action('wp_ajax_pdf_gallery_freemius_deactivate', array($this, 'handle_freemius_deactivate'));
        
        // Script filter
        add_filter('script_loader_tag', array($this, 'modify_script_tag'), 10, 3);

        // Plugin action links
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'plugin_action_links'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_menu_page(
            'PDF Gallery',                  // Page title
            'PDF Gallery',                  // Menu title
            'manage_options',               // Capability required
            'pdf-gallery-manager',          // Menu slug
            array($this, 'render_admin_page'), // Callback function
            'dashicons-media-document',     // Icon
            100                            // Position (high number = bottom of menu)
        );

    }
    
    /**
     * Get asset URL (predictable filenames first, fallback to hashed)
     */
    private function get_asset_url($type) {
        $plugin_dir = plugin_dir_path(__FILE__);
        $plugin_url = plugin_dir_url(__FILE__);
        
        // Preferred predictable filenames produced by Vite config
        $predictable = $plugin_dir . 'dist/assets/index.' . $type;
        if (file_exists($predictable)) {
            return $plugin_url . 'dist/assets/index.' . $type;
        }
        
        // Fallback: detect hashed filenames (index-*.js/css)
        $dist_dir = $plugin_dir . 'dist/assets/';
        if (is_dir($dist_dir)) {
            $files = scandir($dist_dir);
            foreach ($files as $file) {
                if ($type === 'js' && preg_match('/index-[a-zA-Z0-9]+\\.js$/', $file)) {
                    return $plugin_url . 'dist/assets/' . $file;
                }
                if ($type === 'css' && preg_match('/index-[a-zA-Z0-9]+\\.css$/', $file)) {
                    return $plugin_url . 'dist/assets/' . $file;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Enqueue scripts and styles for admin page
     */
    public function enqueue_admin_scripts($hook_suffix) {
        // Only load on our admin page
        if ($hook_suffix !== 'toplevel_page_pdf-gallery-manager') {
            return;
        }
        
        // Get asset files dynamically
        $js_file = $this->get_asset_url('js');
        $css_file = $this->get_asset_url('css');
        
        if (!$js_file || !$css_file) {
            // Show error message in admin if assets not found
            add_action('admin_notices', array($this, 'assets_not_found_notice'));
            return;
        }
        
        // Enqueue the React app's JS and CSS
        wp_enqueue_script(
            'pdf-gallery-admin', 
            $js_file, 
            array(), 
            '1.3.2', 
            true
        );
        wp_script_add_data('pdf-gallery-admin', 'type', 'module');
        
        wp_enqueue_style(
            'pdf-gallery-admin', 
            $css_file, 
            array(), 
            '1.3.2'
        );
        
        // Pass WordPress user info to React app
        $upload_dir = wp_upload_dir();
        
        // Freemius helper URLs for account/pricing (if SDK is available)
        $fs_account_url = '';
        $fs_pricing_url = '';
        if ( function_exists('pdfgallery_fs') ) {
            $fs = pdfgallery_fs();
            if ( is_object( $fs ) ) {
                if ( method_exists( $fs, 'get_account_url' ) ) {
                    $fs_account_url = $fs->get_account_url();
                }
                if ( method_exists( $fs, 'get_upgrade_url' ) ) {
                    $fs_pricing_url = $fs->get_upgrade_url();
                }
            }
        }
        
        wp_localize_script('pdf-gallery-admin', 'wpPDFGallery', array(
            'isAdmin' => current_user_can('manage_options'),
            'nonce' => wp_create_nonce('pdf_gallery_nonce'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'uploadsUrl' => isset($upload_dir['baseurl']) ? $upload_dir['baseurl'] : '',
            'fsAccountUrl' => $fs_account_url,
            'fsPricingUrl' => $fs_pricing_url,
        ));
    }
    public function assets_not_found_notice() {
        echo '<div class="notice notice-error"><p>PDF Gallery: Plugin assets not found. Please rebuild the plugin.</p></div>';
    }
    
    /**
     * Render the admin page
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        echo '<div class="wrap">';
        echo '<h1>PDF Gallery</h1>';
        echo '<div id="pdf-gallery-root" style="margin-top: 20px;"></div>';
        echo '</div>';
    }
    
    /**
     * Shortcode to display gallery on frontend
     */
public function display_gallery_shortcode($atts) {
    // Parse attributes
    $atts = shortcode_atts(array(
        'show_admin' => 'false',
        'name' => ''
    ), $atts, 'pdf_gallery');

    // Build iframe URL to isolate styles from the host theme
    $index_url = plugins_url('dist/index.html', __FILE__);
    $nonce = wp_create_nonce('pdf_gallery_nonce');
    $admin = ($atts['show_admin'] === 'true' && current_user_can('manage_options')) ? 'true' : 'false';
    $ajax = admin_url('admin-ajax.php');

    $src = add_query_arg(array(
        'nonce' => $nonce,
        'ajax'  => $ajax,
        'admin' => $admin,
        'name'  => sanitize_title($atts['name'])
    ), $index_url);

    // Responsive iframe container with flexible height and no internal scrollbars (auto-resize via postMessage)
    $iframe_id = 'pdf-gallery-iframe-' . uniqid();
    $html  = '<div class="pdf-gallery-iframe-container" id="' . esc_attr($iframe_id) . '-container" style="position:relative;width:100%;overflow:hidden;">';
    $html .= '<style>
    .pdf-gallery-iframe-container{overflow:hidden!important;width:100%;position:relative;}
    .pdf-gallery-iframe-container iframe{display:block;width:100%!important;border:0!important;overflow:hidden!important;scrolling:no!important;-webkit-overflow-scrolling:auto!important;-ms-overflow-style:none!important;scrollbar-width:none!important;}
    .pdf-gallery-iframe-container iframe::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;background:transparent!important;}
    @media (max-width:768px){
      .pdf-gallery-iframe-container{overflow:hidden!important; width:100vw; position:relative; left:50%; transform:translateX(-50%);} 
      .pdf-gallery-iframe-container iframe{overflow:hidden!important;scrolling:no!important;}
    }
    </style>';
    $html .= '<iframe id="' . esc_attr($iframe_id) . '" src="' . esc_url($src) . '" scrolling="no" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" style="height:1px;min-height:600px;overflow:hidden;"></iframe>';
    $html .= '</div>';
    
    // Auto-resize listener: receives height from the iframe app and adjusts dynamically (great for mobile)
    $html .= '<script>(function(){
      var iframe = document.getElementById("' . $iframe_id . '");
      if(!iframe) return;
      function onMsg(e){ try{ if(!e || !e.data) return; var d = e.data; if(d.type === "pdf-gallery:height" && typeof d.height === "number"){ var minH = 600; iframe.style.height = Math.max(d.height, minH) + "px"; } }catch(err){} }
      window.addEventListener("message", onMsg, false);
      // Trigger a height check after a short delay to avoid clipping
      setTimeout(function(){ if(iframe && iframe.contentWindow){ iframe.contentWindow.postMessage({type:"pdf-gallery:height-check"}, "*"); } }, 700);
    })();</script>';

    return $html;
}
    
    /**
     * Plugin activation
     */
    public static function activate() {
        // Check if wp_mkdir_p function exists
        if (!function_exists('wp_mkdir_p')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }
        
        // Create upload directory if it doesn't exist
        $upload_dir = wp_upload_dir();
        if (isset($upload_dir['basedir'])) {
            $pdf_gallery_dir = $upload_dir['basedir'] . '/pdf-gallery';
            if (!file_exists($pdf_gallery_dir)) {
                wp_mkdir_p($pdf_gallery_dir);
            }
        }
        
        // Set default options
        add_option('pdf_gallery_version', '1.6.3');
    }
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Clean up if needed
        delete_option('pdf_gallery_version');
    }
    
    /**
     * Ensure our scripts load as ES modules
     */
    public function modify_script_tag($tag, $handle, $src) {
        if (in_array($handle, array('pdf-gallery-admin', 'pdf-gallery-frontend'), true)) {
            $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
        }
        return $tag;
    }
    
    /**
     * Add links on the plugins page
     */
    public function plugin_action_links($links) {
        $site_link = '<a href="https://kindpixels.com" target="_blank" rel="noopener noreferrer">Visit plugin site</a>';
        $upgrade_link = '<a href="https://kindpixels.com/pdf-gallery/" target="_blank" style="font-weight: bold;">Upgrade to Pro!</a>';
        
        // Add site link first, then upgrade link at the end
        array_unshift($links, $site_link);
        $links[] = $upgrade_link;
        
        return $links;
    }
    
    /**
     * Handle AJAX requests
     */
    public function handle_pdf_gallery_ajax() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
            wp_die('Security check failed');
        }
        
        // Handle different AJAX actions here
        $action_type = isset($_POST['action_type']) ? sanitize_text_field($_POST['action_type']) : '';
        
        switch ($action_type) {
            case 'save_items':
                $this->handle_save_items();
                break;
            case 'get_items':
                $this->handle_get_items();
                break;
            case 'save_settings':
                $this->handle_save_settings();
                break;
            case 'get_settings':
                $this->handle_get_settings();
                break;
            case 'upload_pdf':
                $this->handle_upload_pdf();
                break;
            case 'get_galleries':
                $this->handle_get_galleries();
                break;
            case 'save_galleries':
                $this->handle_save_galleries();
                break;
            default:
                wp_send_json_error('Invalid action');
        }
    }
    
    /**
     * Initialize Freemius SDK
     */
    public function init_freemius() {
        // Initialize Freemius SDK
        if (!function_exists('fs_get_plugins')) {
            return;
        }

        global $pdf_gallery_freemius;
        
        if (!isset($pdf_gallery_freemius)) {
            // Include Freemius SDK
            // require_once dirname(__FILE__) . '/freemius/start.php';
            
            /*
            $pdf_gallery_freemius = fs_dynamic_init(array(
                'id'                  => 'YOUR_FREEMIUS_ID', // Replace with your Freemius plugin ID
                'slug'                => 'pdf-gallery',
                'type'                => 'plugin',
                'public_key'          => 'YOUR_PUBLIC_KEY', // Replace with your public key
                'is_premium'          => false,
                'has_addons'          => false,
                'has_paid_plans'      => true,
                'menu'                => array(
                    'slug'           => 'pdf-gallery-manager',
                    'override_exact' => true,
                    'contact'        => false,
                    'support'        => false,
                ),
            ));
            */
        }

        return isset($pdf_gallery_freemius) ? $pdf_gallery_freemius : null;
    }

    /**
     * Handle Freemius license check
     */
    public function handle_freemius_check() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
            wp_die('Security check failed');
        }

        // Local override: if user explicitly disabled Pro, force Free state
        $disabled = get_option('pdf_gallery_pro_disabled', '0');
        if ($disabled === '1') {
            wp_send_json_success( array( 'license' => array(
                'isValid' => true,
                'isPro' => false,
                'status' => 'free',
            ) ) );
        }

        $license_info = array(
            'isValid' => true,
            'isPro' => false,
            'status' => 'free'
        );

        // Check Freemius SDK for license state only (no local fallbacks)
        if ( function_exists( 'pdfgallery_fs' ) ) {
            $fs = pdfgallery_fs();
            if ( is_object( $fs ) ) {
                if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_plan' ) && $fs->is_plan( 'professional', true ) ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) {
                    $license_info['status'] = 'trial';
                    $license_info['isPro'] = true; // Trial counts as Pro
                }
            }
        }

        wp_send_json_success( array( 'license' => $license_info ) );
    }

    /**
     * Handle Freemius license activation
     */
    public function handle_freemius_activate() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
            wp_die('Security check failed');
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }
        
        $license_key = isset($_POST['license_key']) ? sanitize_text_field($_POST['license_key']) : '';
        
        if (empty($license_key)) {
            wp_send_json_error(array('message' => 'License key is required'));
            return;
        }

        // Use the Freemius SDK initialized at the top of the file
        if ( function_exists( 'pdfgallery_fs' ) ) {
            $fs = pdfgallery_fs();
            
            if ( ! is_object( $fs ) ) {
                wp_send_json_error( array( 'message' => 'Licensing system unavailable (Freemius not initialized).' ) );
            }

            try {
                $result  = null;
                $success = false;

                if ( method_exists( $fs, 'activate_migrated_license' ) ) {
                    $result = $fs->activate_migrated_license( $license_key );
                } elseif ( method_exists( $fs, 'activate_license' ) ) {
                    $result = $fs->activate_license( $license_key );
                } elseif ( method_exists( $fs, 'activate_premium' ) ) {
                    $result = $fs->activate_premium( $license_key );
                }

                if ( $result && ! is_wp_error( $result ) ) {
                    $success = true;
                } elseif ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
                    // Some Freemius versions update state without returning a structured result
                    $success = true;
                }

                if ( $success ) {
                    delete_option( 'pdf_gallery_license_data' );
                    delete_option( 'pdf_gallery_pro_disabled' );
                    update_option( 'pdf_gallery_license_key', $license_key );
                    wp_send_json_success( array( 'message' => 'License activated successfully' ) );
                } else {
                    $error_msg = is_wp_error( $result ) ? $result->get_error_message() : 'Invalid or expired license key';
                    wp_send_json_error( array( 'message' => $error_msg ) );
                }
            } catch ( Exception $e ) {
                wp_send_json_error( array( 'message' => 'Activation failed: ' . $e->getMessage() ) );
            }
        } else {
            wp_send_json_error( array( 'message' => 'Licensing system not available' ) );
        }
    }

    /**
     * Handle Freemius license deactivation
     */
    public function handle_freemius_deactivate() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
            wp_die('Security check failed');
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }

        // Mark Pro as locally disabled and clear stored license
        update_option('pdf_gallery_pro_disabled', '1');
        delete_option('pdf_gallery_license_key');
        delete_option('pdf_gallery_license_data');

        // Attempt to deactivate via Freemius SDK
        if ( function_exists( 'pdfgallery_fs' ) ) {
            $fs = pdfgallery_fs();
            
            if ( is_object( $fs ) && method_exists( $fs, 'deactivate_license' ) ) {
                try {
                    $fs->deactivate_license();
                } catch ( Exception $e ) {
                    // Continue even if SDK deactivation fails
                }
            }
        }

        wp_send_json_success( array( 'message' => 'License deactivated successfully' ) );
    }
    
    private function handle_save_items() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $items_json = isset($_POST['items']) ? stripslashes($_POST['items']) : '';
        $items = json_decode($items_json, true);
        
        if (json_last_error() === JSON_ERROR_NONE && is_array($items)) {
            update_option('pdf_gallery_data', $items);
            wp_send_json_success('PDF gallery items saved successfully');
        } else {
            wp_send_json_error('Invalid PDF gallery data');
        }
    }
    
    private function handle_get_items() {
        $items = get_option('pdf_gallery_data', array());
        wp_send_json_success(array('items' => $items));
    }
    
    private function handle_save_settings() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        $settings_json = isset($_POST['settings']) ? stripslashes($_POST['settings']) : '';
        $settings = json_decode($settings_json, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($settings)) {
            update_option('pdf_gallery_settings', $settings);
            wp_send_json_success('Settings saved');
        } else {
            wp_send_json_error('Invalid settings data');
        }
    }
    
    private function handle_get_settings() {
        $defaults = array(
            'thumbnailStyle' => 'default',
            'accentColor' => '#7FB3DC',
            'thumbnailShape' => 'landscape-16-9',
            'pdfIconPosition' => 'top-right',
            'defaultPlaceholder' => 'default',
        );
        $settings = get_option('pdf_gallery_settings', $defaults);
        $settings = array_merge($defaults, is_array($settings) ? $settings : array());
        wp_send_json_success(array('settings' => $settings));
    }
    
    private function handle_get_galleries() {
        // Fetch galleries and current selection. If not present, migrate from legacy items
        $galleries = get_option('pdf_gallery_galleries', null);
        $current_id = get_option('pdf_gallery_current_gallery_id', '');

        if (!is_array($galleries)) {
            $legacy_items = get_option('pdf_gallery_data', array());
            if (is_array($legacy_items) && count($legacy_items) > 0) {
                $galleries = array(
                    array(
                        'id' => 'main',
                        'name' => 'Main Gallery',
                        'items' => $legacy_items,
                        'createdAt' => current_time('mysql'),
                    )
                );
                $current_id = 'main';
                update_option('pdf_gallery_galleries', $galleries);
                update_option('pdf_gallery_current_gallery_id', $current_id);
            } else {
                $galleries = array(
                    array(
                        'id' => 'main',
                        'name' => 'Main Gallery',
                        'items' => array(),
                        'createdAt' => current_time('mysql'),
                    )
                );
                $current_id = 'main';
                update_option('pdf_gallery_galleries', $galleries);
                update_option('pdf_gallery_current_gallery_id', $current_id);
            }
        }

        // If galleries option exists but is empty, try to restore from backup or legacy
        if (is_array($galleries) && count($galleries) === 0) {
            $backup = get_option('pdf_gallery_galleries_backup', null);
            if (is_array($backup) && count($backup) > 0) {
                $galleries = $backup;
                $current_id = isset($galleries[0]['id']) ? $galleries[0]['id'] : 'main';
                update_option('pdf_gallery_galleries', $galleries);
                update_option('pdf_gallery_current_gallery_id', $current_id);
            } else {
                $legacy_items = get_option('pdf_gallery_data', array());
                if (is_array($legacy_items) && count($legacy_items) > 0) {
                    $galleries = array(
                        array(
                            'id' => 'main',
                            'name' => 'Main Gallery',
                            'items' => $legacy_items,
                            'createdAt' => current_time('mysql'),
                        )
                    );
                    $current_id = 'main';
                    update_option('pdf_gallery_galleries', $galleries);
                    update_option('pdf_gallery_current_gallery_id', $current_id);
                } else {
                    $galleries = array(
                        array(
                            'id' => 'main',
                            'name' => 'Main Gallery',
                            'items' => array(),
                            'createdAt' => current_time('mysql'),
                        )
                    );
                    $current_id = 'main';
                    update_option('pdf_gallery_galleries', $galleries);
                    update_option('pdf_gallery_current_gallery_id', $current_id);
                }
            }
        }

        if (empty($current_id) && is_array($galleries) && count($galleries) > 0) {
            $current_id = isset($galleries[0]['id']) ? $galleries[0]['id'] : 'main';
            update_option('pdf_gallery_current_gallery_id', $current_id);
        }

        // Front-end request can specify a gallery name to preview via shortcode
        if (isset($_POST['requested_gallery_name'])) {
            $req = sanitize_text_field($_POST['requested_gallery_name']);
            if (!empty($req) && is_array($galleries)) {
                $slug = sanitize_title($req);
                foreach ($galleries as $g) {
                    $gname = isset($g['name']) ? $g['name'] : '';
                    if (sanitize_title($gname) === $slug) {
                        $current_id = $g['id'];
                        break;
                    }
                }
            }
        }

        wp_send_json_success(array(
            'galleries' => $galleries,
            'current_gallery_id' => $current_id,
        ));
    }

    private function handle_save_galleries() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        $galleries_json = isset($_POST['galleries']) ? stripslashes($_POST['galleries']) : '';
        $current_id = isset($_POST['current_gallery_id']) ? sanitize_text_field($_POST['current_gallery_id']) : '';
        $galleries = json_decode($galleries_json, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($galleries)) {
            // Refuse to overwrite with an empty array (safety)
            if (count($galleries) === 0) {
                wp_send_json_error('Refusing to overwrite galleries with empty payload');
            }
            // Backup current value before overwriting
            $existing = get_option('pdf_gallery_galleries', null);
            if (is_array($existing) && count($existing) > 0) {
                update_option('pdf_gallery_galleries_backup', $existing);
            }
            update_option('pdf_gallery_galleries', $galleries);
            if (!empty($current_id)) {
                update_option('pdf_gallery_current_gallery_id', $current_id);
            }
            wp_send_json_success('Galleries saved successfully');
        } else {
            wp_send_json_error('Invalid galleries data');
        }
    }

    private function handle_upload_pdf() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        if (!isset($_FILES['pdf_file'])) {
            wp_send_json_error('No file uploaded');
        }
        
        $file = $_FILES['pdf_file'];
        
        $allowed_types = array(
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        );
        if (!in_array($file['type'], $allowed_types, true)) {
            wp_send_json_error('Only PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, and image files are allowed');
        }
        
        if ($file['size'] > 10 * 1024 * 1024) {
            wp_send_json_error('File size too large. Maximum 10MB allowed.');
        }
        
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $upload_overrides = array('test_form' => false);
        $uploaded_file = wp_handle_upload($file, $upload_overrides);
        
        if (isset($uploaded_file['error'])) {
            wp_send_json_error($uploaded_file['error']);
        }
        
        $attachment = array(
            'post_mime_type' => $uploaded_file['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', basename($uploaded_file['file'])),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        $attachment_id = wp_insert_attachment($attachment, $uploaded_file['file']);
        
        if (is_wp_error($attachment_id)) {
            wp_send_json_error('Failed to create attachment');
        }
        
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $uploaded_file['file']);
        wp_update_attachment_metadata($attachment_id, $attachment_data);
        
        wp_send_json_success(array(
            'url' => $uploaded_file['url'],
            'attachment_id' => $attachment_id,
            'filename' => basename($uploaded_file['file'])
        ));
    }
    
    /**
     * Handle image upload
     */
    public function handle_pdf_gallery_upload_image() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
            wp_die('Security check failed');
        }
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        if (!isset($_FILES['image_file'])) {
            wp_send_json_error('No file uploaded');
        }
        
        $file = $_FILES['image_file'];
        $allowed = array('image/jpeg','image/png','image/gif','image/webp','image/svg+xml');
        if (!in_array($file['type'], $allowed, true)) {
            wp_send_json_error('Only image files are allowed');
        }
        
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        $upload_overrides = array('test_form' => false);
        $uploaded_file = wp_handle_upload($file, $upload_overrides);
        if (isset($uploaded_file['error'])) {
            wp_send_json_error($uploaded_file['error']);
        }
        
        $attachment = array(
            'post_mime_type' => $uploaded_file['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', basename($uploaded_file['file'])),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        $attachment_id = wp_insert_attachment($attachment, $uploaded_file['file']);
        if (is_wp_error($attachment_id)) {
            wp_send_json_error('Failed to create attachment');
        }
        
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $uploaded_file['file']);
        wp_update_attachment_metadata($attachment_id, $attachment_data);
        
        wp_send_json_success(array(
            'url' => $uploaded_file['url'],
            'attachment_id' => $attachment_id,
            'filename' => basename($uploaded_file['file'])
        ));
    }
}

// Initialize the plugin only if WordPress is properly loaded
if (defined('ABSPATH')) {
    // Register activation/deactivation hooks using static methods for reliability
    register_activation_hook(__FILE__, array('PDF_Gallery_Plugin', 'activate'));
    register_deactivation_hook(__FILE__, array('PDF_Gallery_Plugin', 'deactivate'));
    new PDF_Gallery_Plugin();
}