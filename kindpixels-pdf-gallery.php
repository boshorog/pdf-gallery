<?php
/**
 * Plugin Name: KindPixels PDF Gallery
 * Plugin URI: https://kindpixels.com/plugins/kindpixels-pdf-gallery/
 * Description: Create visually stunning galleries from PDF, video, audio, and document files. Easily organize, sort, and showcase your files in beautiful grid layouts.
 * Version: 2.4.3
 * Author: KIND PIXELS
 * Author URI: https://kindpixels.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: kindpixels-pdf-gallery
 * Requires at least: 5.8
 * Tested up to: 6.9
 */
// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Prevent double-loading within this request (avoids "Cannot redeclare" fatals)
if ( defined( 'KINDPDFG_PLUGIN_LOADED' ) ) {
    return;
}
define( 'KINDPDFG_PLUGIN_LOADED', true );

define( 'KINDPDFG_VERSION', '2.4.3' );

// Freemius SDK Initialization
if ( ! function_exists( 'kindpdfg_fs' ) ) {
    /**
     * Get Freemius SDK instance.
     *
     * @return object Freemius SDK instance or stdClass if not available.
     */
    function kindpdfg_fs() {
        global $kindpdfg_fs_instance;

        if ( ! isset( $kindpdfg_fs_instance ) ) {
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
                // Determine if this is a Pro build (set at compile time via VITE_BUILD_VARIANT)
                // The dist/assets will contain either free or pro code based on npm run build:free/pro
                $is_premium_build = file_exists( dirname( __FILE__ ) . '/dist/.pro-build' );
                
                $kindpdfg_fs_instance = fs_dynamic_init( array(
                    'id'                => '20814',
                    'slug'              => 'kindpixels-pdf-gallery',
                    'premium_slug'      => 'kindpixels-pdf-gallery-pro',
                    'premium_suffix'    => 'Pro',        // Adds "Pro" to plugin name in Freemius UI
                    'type'              => 'plugin',
                    'public_key'        => 'pk_349523fbf9f410023e4e5a4faa9b8',
                    'is_premium'        => $is_premium_build,
                    'is_premium_only'   => false,        // Free version exists on WordPress.org
                    'is_org_compliant'  => ! $is_premium_build, // Only free version is on WP.org
                    'has_addons'        => false,
                    'has_paid_plans'    => true,
                    'anonymous_mode'    => ! $is_premium_build, // Premium users opt-in
                    'opt_in_moderation' => array(
                        'new'       => 0,
                        'updates'   => 0,
                        'localhost' => false,
                    ),
                    'menu'              => array(
                        'slug'       => 'kindpixels-pdf-gallery',
                        'first-path' => 'admin.php?page=kindpixels-pdf-gallery', // Redirect after activation
                        'account'    => $is_premium_build,  // Show account page only for Pro
                        'support'    => false,
                    ),
                ) );

                // Ensure Freemius is aware of this plugin's basename for proper linkage
                if ( is_object( $kindpdfg_fs_instance ) && method_exists( $kindpdfg_fs_instance, 'set_basename' ) ) {
                    $kindpdfg_fs_instance->set_basename( false, __FILE__ );
                }
            } else {
                // SDK not installed or failed to load
                $kindpdfg_fs_instance = new stdClass();
            }
        }

        return $kindpdfg_fs_instance;
    }

    // Init Freemius
    kindpdfg_fs();

    // Force redirect to plugin page after license activation (clears cache)
    kindpdfg_fs()->add_action( 'after_license_change', 'kindpdfg_after_license_change' );
    
    do_action( 'kindpdfg_fs_loaded' );
}

/**
 * Redirect to plugin page after license activation/deactivation.
 * This forces a fresh page load so React gets the updated license status.
 */
function kindpdfg_after_license_change( $plan_change ) {
    if ( ! is_admin() ) {
        return;
    }
    
    // Set a transient to trigger JS/CSS cache-bust on the next few page loads.
    // We store a stable timestamp and let it expire naturally to survive multiple reloads.
    set_transient( 'kindpdfg_license_changed', time(), 300 );
    
    // Redirect to plugin page with cache-bust parameter
    $redirect_url = add_query_arg( array(
        'page'          => 'kindpixels-pdf-gallery',
        'license_updated' => time(),
    ), admin_url( 'admin.php' ) );
    
    wp_safe_redirect( $redirect_url );
    exit;
}

class KindPDFG_Plugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        $this->maybe_upgrade();

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_shortcode('kindpdfg_gallery', array($this, 'display_gallery_shortcode'));
        
        // AJAX handlers
        add_action('wp_ajax_kindpdfg_action', array($this, 'handle_kindpdfg_ajax'));
        add_action('wp_ajax_nopriv_kindpdfg_action', array($this, 'handle_kindpdfg_ajax'));
        add_action('wp_ajax_kindpdfg_upload_image', array($this, 'handle_kindpdfg_upload_image'));
        add_action('wp_ajax_kindpdfg_freemius_check', array($this, 'handle_freemius_check'));
        add_action('wp_ajax_kindpdfg_freemius_activate', array($this, 'handle_freemius_activate'));
        add_action('wp_ajax_kindpdfg_freemius_deactivate', array($this, 'handle_freemius_deactivate'));
        
        // Script filter
        add_filter('script_loader_tag', array($this, 'modify_script_tag'), 10, 3);

        // Plugin action links
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'plugin_action_links'), 99, 1);
        // Plugin row meta links (right side)
        add_filter('plugin_row_meta', array($this, 'plugin_row_meta'), 99, 2);
        
        // Activation redirect for onboarding
        add_action('admin_init', array($this, 'activation_redirect'));
        
        // Hide other plugins' notices on our admin page
        add_action('admin_print_styles', array($this, 'hide_other_plugin_notices'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        // Custom SVG icon matching our exact PDF Gallery logo (3x3 grid with bottom-right missing)
        // Simplified version of src/assets/pdf-gallery-logo.svg for WordPress admin menu
        $icon_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="black" d="M3.8 0.06l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M11.04 0.06l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M18.27 0.06l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M3.8 7.31l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M11.04 7.31l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M18.27 7.31l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M3.8 14.56l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/><path fill="black" d="M11.04 14.56l-2.07 0c-0.92,0 -1.66,0.74 -1.66,1.66l0 2.07c0,0.92 0.74,1.66 1.66,1.66l2.07 0c0.92,0 1.66,-0.74 1.66,-1.66l0 -2.07c0,-0.92 -0.74,-1.66 -1.66,-1.66zm0 3.73l-2.07 0 0 -2.07 2.07 0 0 2.07z"/></svg>';
        $icon_base64 = 'data:image/svg+xml;base64,' . base64_encode($icon_svg);
        
        add_menu_page(
            '',                             // Empty page title (we use our own header)
            'PDF Gallery',                  // Menu title (kept short for UX)
            'manage_options',               // Capability required
            'kindpixels-pdf-gallery',       // Menu slug
            array($this, 'render_admin_page'), // Callback function
            $icon_base64,                   // Custom SVG icon (exact PDF Gallery logo)
            100                            // Position (high number = bottom of menu)
        );

    }
    
    /**
     * Hide admin notices from other plugins on PDF Gallery pages
     * Note: We keep WordPress core notices for security and update information
     */
    public function hide_other_plugin_notices() {
        // Check if we're on the PDF Gallery admin page
        $screen = get_current_screen();
        if (!$screen || strpos($screen->id, 'kindpixels-pdf-gallery') === false) {
            return;
        }
        
        // Use CSS to hide ALL third-party notices while keeping only critical WordPress core notices
        // This aggressive approach hides everything except errors, warnings, and update nags
        echo '<style>
            /* Hide ALL notices in the admin header area on PDF Gallery pages */
            body.kindpdfg-admin-page #wpbody-content > .notice,
            body.kindpdfg-admin-page #wpbody-content > .updated,
            body.kindpdfg-admin-page #wpbody-content > div.notice,
            body.kindpdfg-admin-page #wpbody-content > div.updated,
            body.kindpdfg-admin-page .wrap > .notice,
            body.kindpdfg-admin-page .wrap > .updated,
            body.kindpdfg-admin-page .notice,
            body.kindpdfg-admin-page .updated,
            body.kindpdfg-admin-page div[class*="notice"],
            body.kindpdfg-admin-page div[class*="update"] {
                display: none !important;
            }
            /* But show critical WordPress core notices */
            body.kindpdfg-admin-page .notice-error,
            body.kindpdfg-admin-page .notice-warning,
            body.kindpdfg-admin-page .update-nag {
                display: block !important;
            }
        </style>';
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
        if ($hook_suffix !== 'toplevel_page_kindpixels-pdf-gallery') {
            return;
        }
        
        // Enqueue WordPress media library scripts (required for media library button)
        wp_enqueue_media();
        
        // Get asset files dynamically
        $js_file = $this->get_asset_url('js');
        $css_file = $this->get_asset_url('css');
        
        if (!$js_file || !$css_file) {
            // Show error message in admin if assets not found
            add_action('admin_notices', array($this, 'assets_not_found_notice'));
            return;
        }
        
        // Cache-bust version: add a stable timestamp if license recently changed.
        // IMPORTANT: do NOT delete immediately; allow multiple reloads to keep busting.
        $cache_bust = KINDPDFG_VERSION;
        $license_changed_ts = get_transient( 'kindpdfg_license_changed' );
        if ( $license_changed_ts ) {
            $cache_bust = KINDPDFG_VERSION . '.' . intval( $license_changed_ts );
        }
        
        // Enqueue the React app's JS and CSS with version for cache busting
        wp_enqueue_script(
            'kindpdfg-admin', 
            $js_file, 
            array(), 
            $cache_bust,
            true
        );
        wp_script_add_data('kindpdfg-admin', 'type', 'module');
        
        wp_enqueue_style(
            'kindpdfg-admin', 
            $css_file, 
            array(), 
            $cache_bust
        );
        
        // Pass WordPress user info to React app
        $upload_dir = wp_upload_dir();
        
        // Freemius helper URLs and current license state (if SDK is available)
        $fs_account_url = '';
        $fs_pricing_url = '';
        $fs_is_pro      = false;
        $fs_status      = 'free';
        $fs_available   = false;
        $fs_licensed_to = '';
        if ( function_exists('kindpdfg_fs') ) {
            $fs = kindpdfg_fs();
            if ( is_object( $fs ) ) {
                if ( method_exists( $fs, 'get_account_url' ) ) {
                    $fs_account_url = $fs->get_account_url();
                }
                if ( method_exists( $fs, 'get_upgrade_url' ) ) {
                    $fs_pricing_url = $fs->get_upgrade_url();
                }
                // Detect if Freemius SDK methods are actually available
                $fs_available = (
                    method_exists( $fs, 'can_use_premium_code' ) ||
                    method_exists( $fs, 'is_premium' ) ||
                    method_exists( $fs, 'is_paying' ) ||
                    method_exists( $fs, 'is_plan' ) ||
                    method_exists( $fs, 'is_trial' )
                );
                // Determine Pro status server-side for immediate UI correctness
                if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
                    $fs_is_pro = true; $fs_status = 'pro';
                } elseif ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) {
                    $fs_is_pro = true; $fs_status = 'pro';
                } elseif ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) {
                    $fs_is_pro = true; $fs_status = 'pro';
                } elseif ( method_exists( $fs, 'is_plan' ) && $fs->is_plan( 'professional', true ) ) {
                    $fs_is_pro = true; $fs_status = 'pro';
                } elseif ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) {
                    $fs_is_pro = true; $fs_status = 'trial';
                }
                // Get licensed user info
                if ( $fs_is_pro && method_exists( $fs, 'get_user' ) ) {
                    $user = $fs->get_user();
                    if ( is_object( $user ) ) {
                        if ( isset( $user->email ) ) {
                            $fs_licensed_to = $user->email;
                        } elseif ( isset( $user->first ) || isset( $user->last ) ) {
                            $fs_licensed_to = trim( ( isset( $user->first ) ? $user->first : '' ) . ' ' . ( isset( $user->last ) ? $user->last : '' ) );
                        }
                    }
                }
            }
        }
        
        wp_localize_script('kindpdfg-admin', 'kindpdfgData', array(
            'isAdmin' => current_user_can('manage_options'),
            'nonce' => wp_create_nonce('kindpdfg_nonce'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'uploadsUrl' => isset($upload_dir['baseurl']) ? $upload_dir['baseurl'] : '',
            'fsAccountUrl' => $fs_account_url,
            'fsPricingUrl' => $fs_pricing_url,
            'fsIsPro' => $fs_is_pro,
            'fsStatus' => $fs_status,
            'fsAvailable' => $fs_available,
            'licensedTo' => $fs_licensed_to,
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
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'kindpixels-pdf-gallery'));
        }
        
        // Add body class for notice hiding CSS and hide the WordPress admin page title
        echo '<script>document.body.classList.add("kindpdfg-admin-page");</script>';
        echo '<style>.wrap > h1:first-child { display: none !important; }</style>';
        echo '<div class="wrap kindpdfg-admin-page">';
        echo '<div id="kindpdfg-root" style="margin-top: 0;"></div>';
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
    ), $atts, 'kindpdfg_gallery');

    // Build iframe URL to isolate styles from the host theme
    $index_url = plugins_url('dist/index.html', __FILE__);
    $nonce = wp_create_nonce('kindpdfg_nonce');
    $frame_token = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : uniqid('kindpdfg_', true);
    $admin = ($atts['show_admin'] === 'true' && current_user_can('manage_options')) ? 'true' : 'false';
    $ajax = admin_url('admin-ajax.php');

    $src = add_query_arg(array(
        'nonce' => $nonce,
        'ajax'  => $ajax,
        'admin' => $admin,
        'name'  => sanitize_title($atts['name']),
        'frameToken' => $frame_token,
    ), $index_url);

    // Responsive iframe container with flexible height and no internal scrollbars (auto-resize via postMessage)
    $iframe_id = 'kindpdfg-iframe-' . uniqid();
    $html  = '<div class="kindpdfg-iframe-container" id="' . esc_attr($iframe_id) . '-container" style="position:relative;width:100%;overflow:hidden;">';
    $html .= '<style>
    .kindpdfg-iframe-container{overflow:hidden!important;width:100%;position:relative;}
    .kindpdfg-iframe-container iframe{display:block;width:100%!important;border:0!important;overflow:hidden!important;scrolling:no!important;-webkit-overflow-scrolling:auto!important;-ms-overflow-style:none!important;scrollbar-width:none!important;}
    .kindpdfg-iframe-container iframe::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;background:transparent!important;}
    @media (max-width:768px){
      .kindpdfg-iframe-container{overflow:hidden!important; width:100%!important; max-width:100%!important; box-sizing:border-box!important; position:relative!important; left:0!important; right:0!important; margin-left:0!important; margin-right:0!important; padding-left:0!important; padding-right:0!important; transform:none!important;} 
      .kindpdfg-iframe-container iframe{overflow:hidden!important;scrolling:no!important;width:100%!important;max-width:100%!important;margin:0!important;}
    }
    </style>';
    $html .= '<iframe id="' . esc_attr($iframe_id) . '" src="' . esc_url($src) . '" scrolling="no" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-downloads" style="height:1px;min-height:1px;overflow:hidden;"></iframe>';
    $html .= '</div>';
    
    // Auto-resize listener: receives height from the iframe app and adjusts dynamically (great for mobile)
    $html .= '<script>(function(){
      var iframe = document.getElementById("' . $iframe_id . '");
      var container = document.getElementById("' . $iframe_id . '-container");
      if(!iframe || !container) return;

      var token = "' . $frame_token . '";

      var originalContainerStyle = container.getAttribute("style") || "";
      var originalIframeStyle = iframe.getAttribute("style") || "";
      var lastScrollY = 0;
      var heightBeforeFullscreen = "";
      var isFullscreen = false;

      // Some themes (especially on mobile) apply CSS transforms to page wrappers.
      // That can cause position:fixed to behave as if confined to the wrapper.
      // Moving an iframe in the DOM can trigger a reload in some browsers, so we ONLY
      // re-parent to <body> when we detect a transformed ancestor that would break
      // true fullscreen positioning.
      var originalParent = null;
      var originalNextSibling = null;
      var placeholder = document.createComment("kindpdfg-fullscreen-placeholder");

      // Mobile browsers (especially iOS Safari) often reload iframes when moved in the DOM.
      // Skip re-parenting entirely on mobile to avoid page refresh issues.
      function isMobileDevice(){
        try{
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
        }catch(e){ return false; }
      }

      function hasTransformedAncestor(el){
        // Never re-parent on mobile - it causes page reloads
        if(isMobileDevice()) return false;
        try{
          var cur = el && el.parentElement;
          while(cur && cur !== document.body){
            var st = window.getComputedStyle(cur);
            if(st){
              var t = st.transform || st.webkitTransform;
              if(t && t !== "none") return true;
              if(st.perspective && st.perspective !== "none") return true;
              if(st.filter && st.filter !== "none") return true;
            }
            cur = cur.parentElement;
          }
        }catch(err){}
        return false;
      }

      function moveContainerToBody(){
        try{
          if(container.parentNode === document.body) return;
          originalParent = container.parentNode;
          originalNextSibling = container.nextSibling;
          if(originalParent){
            originalParent.insertBefore(placeholder, container);
          }
          document.body.appendChild(container);
        }catch(err){}
      }

      function restoreContainerFromBody(){
        try{
          if(container.parentNode !== document.body) return;
          if(placeholder && placeholder.parentNode){
            placeholder.parentNode.insertBefore(container, placeholder);
            placeholder.parentNode.removeChild(placeholder);
          } else if(originalParent){
            originalParent.insertBefore(container, originalNextSibling);
          }
        }catch(err){}
      }

      function setFullscreen(on){
        try{
          if(on){
            if(isFullscreen) return;
            isFullscreen = true;

            var shouldMove = hasTransformedAncestor(container);
            container.setAttribute("data-kindpdfg-moved", shouldMove ? "1" : "0");
            if(shouldMove) moveContainerToBody();

            lastScrollY = window.scrollY || window.pageYOffset || 0;
            heightBeforeFullscreen = iframe.style.height || "";

            container.setAttribute("data-kindpdfg-fullscreen", "1");
            container.style.position = "fixed";
            container.style.top = "0";
            container.style.left = "0";
            container.style.right = "0";
            container.style.bottom = "0";
            container.style.width = "100vw";
            container.style.height = "100vh";
            container.style.maxWidth = "100vw";
            container.style.maxHeight = "100vh";
            container.style.zIndex = "2147483647";
            container.style.overflow = "hidden";
            container.style.transform = "none";
            container.style.margin = "0";
            container.style.padding = "0";
            container.style.background = "transparent";

            iframe.style.display = "block";
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.maxWidth = "100vw";
            iframe.style.maxHeight = "100vh";
            iframe.style.minHeight = "100vh";
            iframe.style.overflow = "hidden";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.zIndex = "2147483647";

            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
            document.body.style.top = "-" + lastScrollY + "px";
          } else {
            if(!isFullscreen) return;
            isFullscreen = false;

            container.removeAttribute("data-kindpdfg-fullscreen");
            container.setAttribute("style", originalContainerStyle);
            iframe.setAttribute("style", originalIframeStyle);
            if(heightBeforeFullscreen) iframe.style.height = heightBeforeFullscreen;
            iframe.style.position = "";
            iframe.style.top = "";
            iframe.style.left = "";
            iframe.style.zIndex = "";

            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";

            var wasMoved = container.getAttribute("data-kindpdfg-moved") === "1";
            container.removeAttribute("data-kindpdfg-moved");
            if(wasMoved) restoreContainerFromBody();

            window.scrollTo(0, lastScrollY);
          }
        }catch(err){}
      }

      function onMsg(e){
        try{
          if(!e || !e.data) return;
          var d = e.data;
          if(!d || d.token !== token) return;

          if(d.type === "kindpdfg:height" && typeof d.height === "number"){
            if(isFullscreen) return;
            var minH = 1;
            iframe.style.height = Math.max(d.height, minH) + "px";
          }

          if(d.type === "kindpdfg:lightbox-open") setFullscreen(true);
          if(d.type === "kindpdfg:lightbox-close") setFullscreen(false);
        }catch(err){}
      }

      window.addEventListener("message", onMsg, false);

      // Trigger a height check after a short delay to avoid clipping
      setTimeout(function(){
        if(iframe && iframe.contentWindow){
          iframe.contentWindow.postMessage({type:"kindpdfg:height-check", token: token}, "*");
        }
      }, 700);
    })();</script>';

    return $html;
}

    /**
     * Returns true if a gallery contains at least one actual file item (dividers do not count).
     *
     * @param mixed $gallery
     */
    private static function gallery_has_any_files($gallery) {
        if (!is_array($gallery)) {
            return false;
        }
        if (!isset($gallery['items']) || !is_array($gallery['items'])) {
            return false;
        }

        foreach ($gallery['items'] as $item) {
            if (!is_array($item)) {
                continue;
            }

            // Dividers are not files.
            if (isset($item['type']) && $item['type'] === 'divider') {
                continue;
            }

            // Any non-divider entry is considered a file item.
            return true;
        }

        return false;
    }

    /**
     * Seed the default Test Gallery.
     */
    private static function seed_test_gallery() {
        // Unified sample items for the Test Gallery
        $sample_items = array(
            array('id' => 'div-1', 'type' => 'divider', 'text' => 'First Section'),
            array('id' => 'pdf-1', 'title' => 'Sample Document 1', 'date' => 'January 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-2', 'title' => 'Sample Document 2', 'date' => 'February 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-3', 'title' => 'Sample Document 3', 'date' => 'March 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-4', 'title' => 'Sample Document 4', 'date' => 'April 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-5', 'title' => 'Sample Document 5', 'date' => 'May 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-6', 'title' => 'Sample Document 6', 'date' => 'June 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-7', 'title' => 'Sample Document 7', 'date' => 'July 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'div-2', 'type' => 'divider', 'text' => 'Second Section'),
            array('id' => 'pdf-8', 'title' => 'Sample Document 1', 'date' => 'January 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-9', 'title' => 'Sample Document 2', 'date' => 'February 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-10', 'title' => 'Sample Document 3', 'date' => 'March 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            array('id' => 'pdf-11', 'title' => 'Sample Document 4', 'date' => 'April 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
        );

        $test_gallery = array(
            'id' => 'test',
            'name' => 'Test Gallery',
            'items' => $sample_items,
            'createdAt' => current_time('mysql'),
        );

        update_option('kindpdfg_galleries', array($test_gallery));
        update_option('kindpdfg_current_gallery_id', 'test');
    }

    /**
     * Run upgrade routines on plugin updates (WordPress updates don't trigger activate()).
     */
    private function maybe_upgrade() {
        $stored_version = get_option('kindpdfg_version', '');

        // WordPress in-place updates do NOT run activate(). Also, this specific seeding rule was
        // refined recently, so we run it once even if the version string didn't change.
        $seed_rule_ran = get_option('kindpdfg_seed_rule_checked', '');
        $version_matches = (!empty($stored_version) && $stored_version === KINDPDFG_VERSION);
        if ($version_matches && !empty($seed_rule_ran)) {
            return;
        }

        // Seed rules:
        // - Fresh install (no gallery option)
        // - Exactly one gallery exists but it contains no FILE items (dividers don't count)
        $existing_galleries = get_option('kindpdfg_galleries', 'NOT_SET');
        $is_fresh_install = ($existing_galleries === 'NOT_SET');

        $needs_test_gallery = $is_fresh_install;
        if (!$is_fresh_install && is_array($existing_galleries)) {
            $gallery_count = count($existing_galleries);

            if ($gallery_count === 0) {
                $needs_test_gallery = true;
            } elseif ($gallery_count === 1) {
                $first_gallery = reset($existing_galleries);
                $has_any_files = self::gallery_has_any_files($first_gallery);
                if (!$has_any_files) {
                    $needs_test_gallery = true;
                }
            }
        }

        if ($needs_test_gallery) {
            self::seed_test_gallery();
        }

        update_option('kindpdfg_version', KINDPDFG_VERSION);
        update_option('kindpdfg_seed_rule_checked', '1');
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
            $pdf_gallery_dir = $upload_dir['basedir'] . '/kindpixels-pdf-gallery';
            if (!file_exists($pdf_gallery_dir)) {
                wp_mkdir_p($pdf_gallery_dir);
            }
        }
        
        // Set default options and version
        // Only create Test Gallery on fresh installs or if there's exactly one empty gallery
        // This prevents overwriting user data on plugin updates
        $existing_galleries = get_option('kindpdfg_galleries', 'NOT_SET');
        $is_fresh_install = ($existing_galleries === 'NOT_SET');
        
        // Determine if we need the test gallery:
        // 1. Fresh install (no galleries option exists)
        // 2. Exactly one gallery exists but has no files
        $needs_test_gallery = $is_fresh_install;
        if (!$is_fresh_install && is_array($existing_galleries)) {
            $gallery_count = count($existing_galleries);
            
            if ($gallery_count === 0) {
                // No galleries at all - treat as fresh install
                $needs_test_gallery = true;
            } elseif ($gallery_count === 1) {
                // Exactly one gallery - check if it has any FILE items (dividers do not count)
                $first_gallery = reset($existing_galleries);
                $has_any_files = self::gallery_has_any_files($first_gallery);
                if (!$has_any_files) {
                    // Single empty gallery - replace with test gallery
                    $needs_test_gallery = true;
                }
            }
            // If more than one gallery exists, never add test gallery
        }

        // Store version for tracking (also used for upgrades)
        update_option('kindpdfg_version', KINDPDFG_VERSION);

        if ($needs_test_gallery) {
            self::seed_test_gallery();
        }
        // If existing_galleries is set (even if empty array), preserve user data - don't overwrite

        // Set activation redirect transient for onboarding
        set_transient('kindpdfg_activation_redirect', true, 30);
    }
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Clean up if needed
        delete_option('kindpdfg_version');
    }
    
    /**
     * Redirect to plugin page after activation
     */
    public function activation_redirect() {
        // Check if this is an activation redirect
        if (!get_transient('kindpdfg_activation_redirect')) {
            return;
        }
        
        // Delete the transient so we don't redirect again
        delete_transient('kindpdfg_activation_redirect');
        
        // Don't redirect if activating multiple plugins at once
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- WordPress core sets this during activation
        if (isset($_GET['activate-multi'])) {
            return;
        }
        
        // Don't redirect on network admin
        if (is_network_admin()) {
            return;
        }
        
        // Redirect to plugin page
        wp_safe_redirect(admin_url('admin.php?page=kindpixels-pdf-gallery'));
        exit;
    }
    
    /**
     * Ensure our scripts load as ES modules
     */
    public function modify_script_tag($tag, $handle, $src) {
        if (in_array($handle, array('kindpdfg-admin', 'kindpdfg-frontend'), true)) {
            // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript -- Modifying already enqueued script via script_loader_tag filter
            $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
        }
        return $tag;
    }
    
    /**
     * Add links on the plugins page
     */
    public function plugin_action_links($links) {
        // Remove Freemius and other unwanted links from action links
        foreach ($links as $key => $link) {
            $plain = strtolower(wp_strip_all_tags($link));
            if (strpos($plain, 'opt out') !== false || strpos($plain, 'opt-out') !== false) {
                unset($links[$key]);
                continue;
            }
            if (strpos($plain, 'opt in') !== false || strpos($plain, 'opt-in') !== false || strpos($plain, 'optin') !== false) {
                unset($links[$key]);
                continue;
            }
            if (strpos($plain, 'upgrade') !== false) {
                unset($links[$key]);
                continue;
            }
            if (strpos($plain, 'visit plugin site') !== false) {
                unset($links[$key]);
                continue;
            }
        }
        
        // Add Dashboard link
        $dashboard_link = '<a href="' . esc_url(admin_url('admin.php?page=kindpixels-pdf-gallery')) . '">Dashboard</a>';
        array_unshift($links, $dashboard_link);
        
        // Add our styled Upgrade link only if not Pro
        $is_pro = false;
        if (function_exists('kindpdfg_fs')) {
            $fs = kindpdfg_fs();
            if (is_object($fs) && method_exists($fs, 'is_paying') && $fs->is_paying()) {
                $is_pro = true;
            }
        }
        if (!$is_pro) {
            $upgrade_link = '<a href="' . esc_url(admin_url('admin.php?page=kindpixels-pdf-gallery-pricing')) . '" style="font-weight:600;color:#d97706;">Upgrade to Pro!</a>';
            $links[] = $upgrade_link;
        }
        
        return $links;
    }
    
    /**
     * Filter row meta links on the plugins list (right side)
     */
    public function plugin_row_meta($links, $file) {
        if ($file === plugin_basename(__FILE__)) {
            foreach ($links as $key => $link) {
                $plain = strtolower(wp_strip_all_tags($link));
                $href = '';
                if (preg_match('/href=\"([^\"]+)\"/i', $link, $m)) { $href = strtolower($m[1]); }
                if (strpos($plain, 'opt out') !== false || strpos($plain, 'opt-out') !== false) {
                    unset($links[$key]);
                    continue;
                }
                if (strpos($plain, 'upgrade') !== false) {
                    unset($links[$key]);
                    continue;
                }
            }
        }
        return $links;
    }
    
    /**
     * Handle AJAX requests
     */
    public function handle_kindpdfg_ajax() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'kindpdfg_nonce')) {
            wp_die('Security check failed');
        }
        
        // Handle different AJAX actions here
        $action_type = isset($_POST['action_type']) ? sanitize_text_field(wp_unslash($_POST['action_type'])) : '';
        
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
            case 'upload_chunk':
                $this->handle_upload_chunk();
                break;
            case 'get_galleries':
                $this->handle_get_galleries();
                break;
            case 'save_galleries':
                $this->handle_save_galleries();
                break;
            case 'track_analytics':
                $this->handle_track_analytics();
                break;
            case 'get_analytics':
                $this->handle_get_analytics();
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

        global $kindpdfg_freemius;
        
        if (!isset($kindpdfg_freemius)) {
            // Include Freemius SDK
            // require_once dirname(__FILE__) . '/freemius/start.php';
            
            /*
            $kindpdfg_freemius = fs_dynamic_init(array(
                'id'                  => 'YOUR_FREEMIUS_ID', // Replace with your Freemius plugin ID
                'slug'                => 'kindpixels-pdf-gallery',
                'type'                => 'plugin',
                'public_key'          => 'YOUR_PUBLIC_KEY', // Replace with your public key
                'is_premium'          => false,
                'has_addons'          => false,
                'has_paid_plans'      => true,
                'menu'                => array(
                    'slug'           => 'kindpixels-pdf-gallery',
                    'override_exact' => true,
                    'contact'        => false,
                    'support'        => false,
                ),
            ));
            */
        }

        return isset($kindpdfg_freemius) ? $kindpdfg_freemius : null;
    }

    /**
     * Handle Freemius license check
     */
    public function handle_freemius_check() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'kindpdfg_nonce')) {
            wp_die('Security check failed');
        }

        $license_info = array(
            'isValid' => true,
            'isPro' => false,
            'status' => 'free'
        );

        // Check Freemius SDK for license state
        if ( function_exists( 'kindpdfg_fs' ) ) {
            $fs = kindpdfg_fs();
            if ( is_object( $fs ) ) {
                // Check various Pro indicators below
                
                // Check various Pro indicators
                if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_plan' ) && $fs->is_plan( 'professional', true ) ) {
                    $license_info['isPro'] = true;
                    $license_info['status'] = 'pro';
                } elseif ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) {
                    $license_info['status'] = 'trial';
                    $license_info['isPro'] = true;
                }
                
            }
        }

        wp_send_json_success( array( 'license' => $license_info ) );
    }

    /**
     * Handle Freemius license activation
     */
    public function handle_freemius_activate() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'kindpdfg_nonce')) {
            wp_die('Security check failed');
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }
        
        $license_key = isset($_POST['license_key']) ? sanitize_text_field(wp_unslash($_POST['license_key'])) : '';
        
        if (empty($license_key)) {
            wp_send_json_error(array('message' => 'License key is required'));
            return;
        }

        // Use the Freemius SDK initialized at the top of the file
        if ( function_exists( 'kindpdfg_fs' ) ) {
            $fs = kindpdfg_fs();
            
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

                // After attempting activation, trust only the SDK-reported state
                $pro_now = false;
                if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) {
                    $pro_now = true;
                } elseif ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) {
                    $pro_now = true;
                } elseif ( method_exists( $fs, 'is_plan' ) && $fs->is_plan( 'professional', true ) ) {
                    $pro_now = true;
                } elseif ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) {
                    $pro_now = true;
                }

                if ( $pro_now ) {
                    delete_option( 'kindpdfg_license_data' );
                    update_option( 'kindpdfg_license_key', $license_key );

                    // Ensure the next page loads fetch fresh JS/CSS (avoid users needing a hard refresh)
                    // and give React a deterministic trigger for the ProWelcome message.
                    $ts = time();
                    set_transient( 'kindpdfg_license_changed', $ts, 300 );
                    $redirect_url = add_query_arg( array(
                        'page'             => 'kindpixels-pdf-gallery',
                        'license_activated' => '1',
                        'license_updated'   => $ts,
                    ), admin_url( 'admin.php' ) );

                    wp_send_json_success( array( 
                        'message' => 'License activated successfully',
                        'pro' => true,
                        'redirect' => $redirect_url,
                    ) );
                } else {
                    $error_msg = is_wp_error( $result ) ? $result->get_error_message() : 'Activation reported success but Pro is not enabled by Freemius. Please ensure the key matches this plugin/product and try again.';
                    wp_send_json_error( array( 'message' => $error_msg, 'pro' => false ) );
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
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'kindpdfg_nonce')) {
            wp_die('Security check failed');
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }

        // Clear stored license data
        delete_option('kindpdfg_license_key');
        delete_option('kindpdfg_license_data');

        // Attempt to deactivate via Freemius SDK using the exact same method as the Account page
        if ( function_exists( 'kindpdfg_fs' ) ) {
            $fs = kindpdfg_fs();
            
            if ( is_object( $fs ) ) {
                try {
                    // First try delete_account which fully removes the license association
                    if ( method_exists( $fs, 'delete_account_event' ) ) {
                        $fs->delete_account_event();
                    }
                    
                    // Then explicitly deactivate the license
                    if ( method_exists( $fs, 'deactivate_license' ) ) {
                        $fs->deactivate_license();
                    }
                    
                    // Clear the Freemius stored data
                    if ( method_exists( $fs, 'clear_all_data' ) ) {
                        $fs->clear_all_data();
                    }
                    
                    // Alternative: try to skip connection which resets the license state
                    if ( method_exists( $fs, 'skip_connection' ) ) {
                        $fs->skip_connection();
                    }
                } catch ( Exception $e ) {
                    // Silently continue on deactivation error
                    unset( $e );
                }
            }
        }

        wp_send_json_success( array( 'message' => 'License deactivated successfully' ) );
    }
    
    private function handle_save_items() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $items_json = isset($_POST['items']) ? sanitize_text_field(wp_unslash($_POST['items'])) : '';
        $items = json_decode($items_json, true);
        
        if (json_last_error() === JSON_ERROR_NONE && is_array($items)) {
            update_option('kindpdfg_data', $items);
            wp_send_json_success('PDF gallery items saved successfully');
        } else {
            wp_send_json_error('Invalid PDF gallery data');
        }
    }
    
    private function handle_get_items() {
        $items = get_option('kindpdfg_data', array());
        wp_send_json_success(array('items' => $items));
    }
    
    private function handle_save_settings() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $settings_json = isset($_POST['settings']) ? sanitize_text_field(wp_unslash($_POST['settings'])) : '';
        $settings = json_decode($settings_json, true);

        // Save scope + gallery id (optional)
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $save_scope = isset($_POST['save_scope']) ? sanitize_text_field(wp_unslash($_POST['save_scope'])) : 'all';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $gallery_id = isset($_POST['gallery_id']) ? sanitize_text_field(wp_unslash($_POST['gallery_id'])) : '';

        if (json_last_error() === JSON_ERROR_NONE && is_array($settings)) {
            if ($save_scope === 'current' && !empty($gallery_id)) {
                $per_gallery = get_option('kindpdfg_gallery_settings', array());
                if (!is_array($per_gallery)) {
                    $per_gallery = array();
                }
                $per_gallery[$gallery_id] = $settings;
                update_option('kindpdfg_gallery_settings', $per_gallery);
            } else {
                // Save as global defaults
                update_option('kindpdfg_settings', $settings);

                // Also apply to all galleries so they immediately match
                $galleries = get_option('kindpdfg_galleries', array());
                if (is_array($galleries)) {
                    $per_gallery = array();
                    foreach ($galleries as $g) {
                        if (isset($g['id']) && !empty($g['id'])) {
                            $per_gallery[sanitize_text_field($g['id'])] = $settings;
                        }
                    }
                    update_option('kindpdfg_gallery_settings', $per_gallery);
                }
            }

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
            'thumbnailSize' => 'four-rows',
            // Behavior toggles
            'ratingsEnabled' => false,
            'lightboxEnabled' => true,
        );

        $global_settings = get_option('kindpdfg_settings', array());
        $global_settings = array_merge($defaults, is_array($global_settings) ? $global_settings : array());

        // Determine gallery id (explicit id preferred; fallback to requested_gallery_name)
        $gallery_id = '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
        if (isset($_POST['gallery_id'])) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
            $gallery_id = sanitize_text_field(wp_unslash($_POST['gallery_id']));
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
        if (empty($gallery_id) && isset($_POST['requested_gallery_name'])) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
            $requested = sanitize_text_field(wp_unslash($_POST['requested_gallery_name']));
            $galleries = get_option('kindpdfg_galleries', array());
            if (!empty($requested) && is_array($galleries)) {
                $requested_slug = sanitize_title($requested);
                foreach ($galleries as $g) {
                    $gname = isset($g['name']) ? $g['name'] : '';
                    if (!empty($gname) && sanitize_title($gname) === $requested_slug) {
                        $gallery_id = isset($g['id']) ? sanitize_text_field($g['id']) : '';
                        break;
                    }
                }
            }
        }

        $per_gallery = get_option('kindpdfg_gallery_settings', array());
        $gallery_settings = array();
        if (!empty($gallery_id) && is_array($per_gallery) && isset($per_gallery[$gallery_id]) && is_array($per_gallery[$gallery_id])) {
            $gallery_settings = $per_gallery[$gallery_id];
        }

        $settings = array_merge($global_settings, $gallery_settings);
        wp_send_json_success(array('settings' => $settings));
    }
    
    private function handle_get_galleries() {
        // Fetch galleries and current selection from database
        // IMPORTANT: Never overwrite user data - only seed Test Gallery on truly fresh installs
        $galleries = get_option('kindpdfg_galleries', null);
        $current_id = get_option('kindpdfg_current_gallery_id', '');

        $modified = false;

        // Only seed Test Gallery if NO galleries exist at all (fresh install)
        if (!is_array($galleries) || count($galleries) === 0) {
            // Unified sample items for the Test Gallery
            $sample_items = array(
                array('id' => 'div-1', 'type' => 'divider', 'text' => 'First Section'),
                array('id' => 'pdf-1', 'title' => 'Sample Document 1', 'date' => 'January 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-2', 'title' => 'Sample Document 2', 'date' => 'February 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-3', 'title' => 'Sample Document 3', 'date' => 'March 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-4', 'title' => 'Sample Document 4', 'date' => 'April 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-5', 'title' => 'Sample Document 5', 'date' => 'May 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-6', 'title' => 'Sample Document 6', 'date' => 'June 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-7', 'title' => 'Sample Document 7', 'date' => 'July 2025', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'div-2', 'type' => 'divider', 'text' => 'Second Section'),
                array('id' => 'pdf-8', 'title' => 'Sample Document 1', 'date' => 'January 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-9', 'title' => 'Sample Document 2', 'date' => 'February 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-10', 'title' => 'Sample Document 3', 'date' => 'March 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
                array('id' => 'pdf-11', 'title' => 'Sample Document 4', 'date' => 'April 2024', 'pdfUrl' => 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', 'thumbnail' => '', 'fileType' => 'pdf'),
            );
            $galleries = array(
                array(
                    'id' => 'test',
                    'name' => 'Test Gallery',
                    'items' => $sample_items,
                    'createdAt' => current_time('mysql'),
                )
            );
            $current_id = 'test';
            $modified = true;
        }
        // If galleries exist, preserve them exactly as-is (user data is sacred)

        // If still no current selected, default to first gallery
        if (empty($current_id) && is_array($galleries) && count($galleries) > 0) {
            $current_id = isset($galleries[0]['id']) ? $galleries[0]['id'] : '';
            $modified = true;
        }

        // Front-end request can specify a gallery name to preview via shortcode
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
        $frontend_gallery_override = null;
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
        $is_frontend_request = isset($_POST['requested_gallery_name']);
        if ($is_frontend_request) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax() or public shortcode context
            $req = sanitize_text_field(wp_unslash($_POST['requested_gallery_name']));
            if (!empty($req) && is_array($galleries)) {
                $slug = sanitize_title($req);
                foreach ($galleries as $g) {
                    $gname = isset($g['name']) ? $g['name'] : '';
                    if (sanitize_title($gname) === $slug) {
                        // Set the gallery ID for this request only, don't persist it
                        $frontend_gallery_override = $g['id'];
                        break;
                    }
                }
            }
            // If no match found for the requested name, default to first gallery (not admin's last selection)
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
            if ($frontend_gallery_override === null && is_array($galleries) && count($galleries) > 0) {
                // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
                $frontend_gallery_override = isset($galleries[0]['id']) ? $galleries[0]['id'] : 'test';
            }
        }

        // Persist only if we actually changed something (but never persist frontend gallery overrides)
        if ($modified) {
            update_option('kindpdfg_galleries', $galleries);
            update_option('kindpdfg_current_gallery_id', $current_id);
        }
        
        // For frontend requests, always use the frontend override; for admin requests, use stored current_id
        $response_current_id = $is_frontend_request ? $frontend_gallery_override : $current_id;

        wp_send_json_success(array(
            'galleries' => $galleries,
            'current_gallery_id' => $response_current_id,
        ));
    }

    private function handle_save_galleries() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $galleries_json = isset($_POST['galleries']) ? sanitize_text_field(wp_unslash($_POST['galleries'])) : '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax()
        $current_id = isset($_POST['current_gallery_id']) ? sanitize_text_field(wp_unslash($_POST['current_gallery_id'])) : '';
        $galleries = json_decode($galleries_json, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($galleries)) {
            // Refuse to overwrite with an empty array (safety)
            if (count($galleries) === 0) {
                wp_send_json_error('Refusing to overwrite galleries with empty payload');
            }
            // Backup current value before overwriting
            $existing = get_option('kindpdfg_galleries', null);
            if (is_array($existing) && count($existing) > 0) {
                update_option('kindpdfg_galleries_backup', $existing);
            }
            update_option('kindpdfg_galleries', $galleries);
            if (!empty($current_id)) {
                update_option('kindpdfg_current_gallery_id', $current_id);
            }
            wp_send_json_success('Galleries saved successfully');
        } else {
            wp_send_json_error('Invalid galleries data');
        }
    }

    private function handle_upload_chunk() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        if (!isset($_FILES['chunk'])) {
            wp_send_json_error('No chunk uploaded');
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        $upload_id = isset($_POST['upload_id']) ? sanitize_text_field(wp_unslash($_POST['upload_id'])) : '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        $chunk_index = isset($_POST['chunk_index']) ? intval($_POST['chunk_index']) : 0;
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        $total_chunks = isset($_POST['total_chunks']) ? intval($_POST['total_chunks']) : 1;
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        $filename = isset($_POST['filename']) ? sanitize_file_name(wp_unslash($_POST['filename'])) : 'upload';
        
        if (empty($upload_id)) {
            wp_send_json_error('Missing upload ID');
        }
        
        // Create temp directory for chunks
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/kindpixels-pdf-gallery/temp/' . $upload_id;
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Nonce verified in handle_pdf_gallery_ajax(), file validation handled below
        $chunk_file = $_FILES['chunk'];
        
        // Save chunk to temp directory using WP_Filesystem
        $chunk_path = $temp_dir . '/chunk_' . str_pad($chunk_index, 5, '0', STR_PAD_LEFT);
        
        // Initialize WP_Filesystem
        global $wp_filesystem;
        if ( empty( $wp_filesystem ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }
        
        // Read uploaded chunk content and write using WP_Filesystem
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading from PHP temp upload file
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        $chunk_content = file_get_contents($chunk_file['tmp_name']);
        if ( false === $chunk_content || ! $wp_filesystem->put_contents( $chunk_path, $chunk_content, FS_CHMOD_FILE ) ) {
            wp_send_json_error('Failed to save chunk');
        }
        
        // Check if all chunks are uploaded
        $uploaded_chunks = glob($temp_dir . '/chunk_*');
        $chunks_count = count($uploaded_chunks);
        
        if ($chunks_count === $total_chunks) {
            // All chunks received - reassemble the file
            $final_path = $temp_dir . '/' . $filename;
            
            // Sort chunks and concatenate using WP_Filesystem
            sort($uploaded_chunks);
            $final_content = '';
            foreach ($uploaded_chunks as $chunk) {
                $final_content .= $wp_filesystem->get_contents($chunk);
                wp_delete_file($chunk); // Clean up chunk using WP function
            }
            
            if ( ! $wp_filesystem->put_contents( $final_path, $final_content, FS_CHMOD_FILE ) ) {
                wp_send_json_error('Failed to create final file');
            }
            
            // Move to WordPress uploads using standard upload handling
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            
            // Get file type
            $filetype = wp_check_filetype($filename);
            $mime_type = $filetype['type'] ? $filetype['type'] : 'application/octet-stream';
            
            // Move to proper uploads location
            $upload_file = wp_upload_bits($filename, null, $wp_filesystem->get_contents($final_path));
            
            // Clean up temp file and directory using WP functions
            wp_delete_file($final_path);
            $wp_filesystem->rmdir($temp_dir);
            
            if ($upload_file['error']) {
                wp_send_json_error('Failed to finalize upload: ' . $upload_file['error']);
            }
            
            // Create attachment
            $attachment = array(
                'post_mime_type' => $mime_type,
                'post_title' => preg_replace('/\.[^.]+$/', '', $filename),
                'post_content' => '',
                'post_status' => 'inherit'
            );
            
            $attachment_id = wp_insert_attachment($attachment, $upload_file['file']);
            
            if (is_wp_error($attachment_id)) {
                wp_send_json_error('Failed to create attachment');
            }
            
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload_file['file']);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            
            wp_send_json_success(array(
                'complete' => true,
                'url' => $upload_file['url'],
                'attachment_id' => $attachment_id,
                'filename' => $filename,
                'chunks_received' => $chunks_count,
                'total_chunks' => $total_chunks
            ));
        } else {
            // More chunks expected
            wp_send_json_success(array(
                'complete' => false,
                'chunk_index' => $chunk_index,
                'chunks_received' => $chunks_count,
                'total_chunks' => $total_chunks
            ));
        }
    }

    private function handle_upload_pdf() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_pdf_gallery_ajax()
        if (!isset($_FILES['pdf_file'])) {
            wp_send_json_error('No file uploaded');
        }
        
        // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Nonce verified in handle_pdf_gallery_ajax(), file validation handled by wp_handle_upload()
        $file = $_FILES['pdf_file'];
        
        $allowed_types = array(
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // OpenDocument formats
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
            // Text formats
            'application/rtf',
            'text/rtf',
            'text/plain',
            'text/csv',
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/x-icon',
            'image/vnd.microsoft.icon',
            // Archives
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/vnd.rar',
            'application/x-7z-compressed',
            // eBooks
            'application/epub+zip',
            'application/x-mobipocket-ebook',
            // Audio
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/ogg',
            // Video
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',
            'video/avi',
            'video/x-matroska',
            'video/x-flv',
            'video/x-ms-wmv',
            'video/x-m4v',
            'video/3gpp',
            'video/3gpp2',
            // Additional audio
            'audio/x-m4a',
            'audio/m4a',
            'audio/flac',
            'audio/aac',
            'audio/x-aac'
        );
        if (!in_array($file['type'], $allowed_types, true)) {
            wp_send_json_error('File type not allowed. Supported: documents, images, audio, video, archives, and eBooks.');
        }
        
        // For non-chunked uploads, keep 100MB limit (chunked uploads handle larger files)
        if ($file['size'] > 100 * 1024 * 1024) {
            wp_send_json_error('File size too large. Maximum 100MB for direct upload. Use chunked upload for larger files.');
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
    public function handle_kindpdfg_upload_image() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'kindpdfg_nonce')) {
            wp_die('Security check failed');
        }
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        if (!isset($_FILES['image_file'])) {
            wp_send_json_error('No file uploaded');
        }
        
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- File validation handled by wp_handle_upload()
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

    /**
     * Handle analytics tracking (Pro feature)
     * Stores view/click events in wp_options
     */
    private function handle_track_analytics() {
        // Only Pro users can track analytics
        $is_pro = false;
        if ( function_exists( 'kindpdfg_fs' ) ) {
            $fs = kindpdfg_fs();
            if ( is_object( $fs ) ) {
                if ( ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) ||
                     ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) ||
                     ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) ) {
                    $is_pro = true;
                }
            }
        }

        if ( ! $is_pro ) {
            wp_send_json_error( 'Pro feature required' );
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax().
        $gallery_id = isset( $_POST['gallery_id'] ) ? sanitize_text_field( wp_unslash( $_POST['gallery_id'] ) ) : '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax().
        $event_type = isset( $_POST['event_type'] ) ? sanitize_text_field( wp_unslash( $_POST['event_type'] ) ) : '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax().
        $document_id = isset( $_POST['document_id'] ) ? sanitize_text_field( wp_unslash( $_POST['document_id'] ) ) : '';
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax().
        $visitor_id = isset( $_POST['visitor_id'] ) ? sanitize_text_field( wp_unslash( $_POST['visitor_id'] ) ) : '';

        if ( empty( $gallery_id ) || empty( $event_type ) || empty( $visitor_id ) ) {
            wp_send_json_error( 'Missing required fields' );
            return;
        }

        if ( ! in_array( $event_type, array( 'view', 'click' ), true ) ) {
            wp_send_json_error( 'Invalid event type' );
            return;
        }

        // Get existing analytics data
        $analytics = get_option( 'kindpdfg_analytics', array() );
        if ( ! is_array( $analytics ) ) {
            $analytics = array();
        }

        // Create event record
        $event = array(
            'gallery_id'  => $gallery_id,
            'event_type'  => $event_type,
            'document_id' => $document_id,
            'visitor_id'  => $visitor_id,
            'timestamp'   => gmdate( 'Y-m-d H:i:s' ),
            'date'        => gmdate( 'Y-m-d' ),
        );

        // Append event (limit to last 10000 events to prevent bloat)
        $analytics[] = $event;
        if ( count( $analytics ) > 10000 ) {
            $analytics = array_slice( $analytics, -10000 );
        }

        update_option( 'kindpdfg_analytics', $analytics, false );

        wp_send_json_success( array( 'tracked' => true ) );
    }

    /**
     * Handle fetching analytics data (Pro feature)
     */
    private function handle_get_analytics() {
        // Only Pro users can view analytics
        $is_pro = false;
        if ( function_exists( 'kindpdfg_fs' ) ) {
            $fs = kindpdfg_fs();
            if ( is_object( $fs ) ) {
                if ( ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) ||
                     ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) ||
                     ( method_exists( $fs, 'is_premium' ) && $fs->is_premium() ) ) {
                    $is_pro = true;
                }
            }
        }

        if ( ! $is_pro ) {
            wp_send_json_error( 'Pro feature required' );
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified in handle_kindpdfg_ajax().
        $gallery_id = isset( $_POST['gallery_id'] ) ? sanitize_text_field( wp_unslash( $_POST['gallery_id'] ) ) : '';

        if ( empty( $gallery_id ) ) {
            wp_send_json_error( 'Gallery ID required' );
            return;
        }

        // Get analytics data
        $all_analytics = get_option( 'kindpdfg_analytics', array() );
        if ( ! is_array( $all_analytics ) ) {
            $all_analytics = array();
        }

        // Filter by gallery
        $gallery_events = array_filter( $all_analytics, function( $event ) use ( $gallery_id ) {
            return isset( $event['gallery_id'] ) && $event['gallery_id'] === $gallery_id;
        } );

        // Calculate stats
        $views = array_filter( $gallery_events, function( $e ) { return $e['event_type'] === 'view'; } );
        $clicks = array_filter( $gallery_events, function( $e ) { return $e['event_type'] === 'click'; } );

        $unique_view_visitors = array_unique( array_column( $views, 'visitor_id' ) );
        $unique_click_visitors = array_unique( array_column( $clicks, 'visitor_id' ) );

        // Document breakdown
        $doc_clicks = array();
        foreach ( $clicks as $click ) {
            $doc_id = $click['document_id'] ?? '';
            if ( empty( $doc_id ) ) continue;
            if ( ! isset( $doc_clicks[ $doc_id ] ) ) {
                $doc_clicks[ $doc_id ] = array( 'total' => 0, 'visitors' => array() );
            }
            $doc_clicks[ $doc_id ]['total']++;
            $doc_clicks[ $doc_id ]['visitors'][ $click['visitor_id'] ] = true;
        }

        // Get document titles from galleries
        $galleries = get_option( 'kindpdfg_galleries', array() );
        $doc_titles = array();
        foreach ( $galleries as $gallery ) {
            if ( isset( $gallery['items'] ) && is_array( $gallery['items'] ) ) {
                foreach ( $gallery['items'] as $item ) {
                    if ( isset( $item['id'], $item['title'] ) ) {
                        $doc_titles[ $item['id'] ] = $item['title'];
                    }
                }
            }
        }

        $documents = array();
        foreach ( $doc_clicks as $doc_id => $data ) {
            $documents[] = array(
                'document_id'   => $doc_id,
                'document_title' => $doc_titles[ $doc_id ] ?? $doc_id,
                'total_clicks'  => $data['total'],
                'unique_clicks' => count( $data['visitors'] ),
            );
        }

        // Sort by total clicks descending
        usort( $documents, function( $a, $b ) {
            return $b['total_clicks'] - $a['total_clicks'];
        } );

        // Daily stats (last 14 days)
        $daily_stats = array();
        for ( $i = 13; $i >= 0; $i-- ) {
            $date = gmdate( 'Y-m-d', strtotime( "-{$i} days" ) );
            $day_views = array_filter( $views, function( $e ) use ( $date ) {
                return isset( $e['date'] ) && $e['date'] === $date;
            } );
            $day_clicks = array_filter( $clicks, function( $e ) use ( $date ) {
                return isset( $e['date'] ) && $e['date'] === $date;
            } );
            $daily_stats[] = array(
                'date'   => $date,
                'views'  => count( $day_views ),
                'clicks' => count( $day_clicks ),
            );
        }

        wp_send_json_success( array(
            'gallery_id'    => $gallery_id,
            'total_views'   => count( $views ),
            'unique_views'  => count( $unique_view_visitors ),
            'total_clicks'  => count( $clicks ),
            'unique_clicks' => count( $unique_click_visitors ),
            'documents'     => $documents,
            'daily_stats'   => $daily_stats,
        ) );
    }
}

// Initialize the plugin only if WordPress is properly loaded
if (defined('ABSPATH')) {
    // Register activation/deactivation hooks using static methods for reliability
    register_activation_hook(__FILE__, array('KindPDFG_Plugin', 'activate'));
    register_deactivation_hook(__FILE__, array('KindPDFG_Plugin', 'deactivate'));
    new KindPDFG_Plugin();
}