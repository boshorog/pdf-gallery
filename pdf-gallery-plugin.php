<?php
/**
 * Plugin Name: PDF Gallery
 * Plugin URI: https://antiohia.ro
 * Description: Manage PDF documents with thumbnail generation and sortable display. Integrates with WordPress admin authentication.
 * Version: 1.0.2
 * Author: uphill
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PDFGalleryPlugin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Add shortcode for frontend display
        add_shortcode('pdf_gallery', array($this, 'display_gallery_shortcode'));
        
        // Register activation/deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
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
            25                             // Position
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
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>PDF Gallery: Plugin assets not found. Please rebuild the plugin.</p></div>';
            });
            return;
        }
        
        // Enqueue the React app's JS and CSS
        wp_enqueue_script(
            'pdf-gallery-admin', 
            $js_file, 
            array(), 
            '1.0.2', 
            true
        );
        wp_script_add_data('pdf-gallery-admin', 'type', 'module');
        
        wp_enqueue_style(
            'pdf-gallery-admin', 
            $css_file, 
            array(), 
            '1.0.2'
        );
        
        // Pass WordPress user info to React app
        wp_localize_script('pdf-gallery-admin', 'wpPDFGallery', array(
            'isAdmin' => current_user_can('manage_options'),
            'nonce' => wp_create_nonce('pdf_gallery_nonce'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'uploadsUrl' => wp_upload_dir()['baseurl']
        ));
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
        'show_admin' => 'false'
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
    ), $index_url);

    // Responsive iframe container with flexible height and no scrollbars
    $html  = '<div class="pdf-gallery-iframe-container" style="position:relative;width:100%;overflow:hidden;">';
    $html .= '<style>.pdf-gallery-iframe-container iframe { -ms-overflow-style: none; scrollbar-width: none; } .pdf-gallery-iframe-container iframe::-webkit-scrollbar { display: none; }</style>';
    $html .= '<iframe src="' . esc_url($src) . '" style="width:100%;height:auto;min-height:600px;border:0;overflow:hidden;" scrolling="no" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" onload="this.style.height=this.contentWindow.document.body.scrollHeight+\'px\'"></iframe>';
    $html .= '</div>';
    
    // Add JavaScript to auto-resize iframe
    $html .= '<script>
    (function() {
        function resizeIframe() {
            const iframe = document.querySelector(".pdf-gallery-iframe-container iframe");
            if (iframe && iframe.contentWindow) {
                try {
                    const height = iframe.contentWindow.document.body.scrollHeight;
                    if (height > 0) {
                        iframe.style.height = height + "px";
                    }
                } catch (e) {
                    // Cross-origin restrictions, fallback to min-height
                }
            }
        }
        
        const iframe = document.querySelector(".pdf-gallery-iframe-container iframe");
        if (iframe) {
            iframe.addEventListener("load", resizeIframe);
            // Also try to resize periodically in case content changes
            setInterval(resizeIframe, 2000);
        }
    })();
    </script>';

    return $html;
}
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create upload directory if it doesn't exist
        $upload_dir = wp_upload_dir();
        $pdf_gallery_dir = $upload_dir['basedir'] . '/pdf-gallery';
        
        if (!file_exists($pdf_gallery_dir)) {
            wp_mkdir_p($pdf_gallery_dir);
        }
        
        // Set default options
        add_option('pdf_gallery_version', '1.0.2');
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up if needed
        delete_option('pdf_gallery_version');
    }
}

// Initialize the plugin
new PDFGalleryPlugin();

// Ensure our scripts load as ES modules even on older WP versions
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if (in_array($handle, array('pdf-gallery-admin', 'pdf-gallery-frontend'), true)) {
        $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
    }
    return $tag;
}, 10, 3);

// AJAX handlers for frontend/backend communication
add_action('wp_ajax_pdf_gallery_action', 'handle_pdf_gallery_ajax');
add_action('wp_ajax_nopriv_pdf_gallery_action', 'handle_pdf_gallery_ajax');

function handle_pdf_gallery_ajax() {
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'pdf_gallery_nonce')) {
        wp_die('Security check failed');
    }
    
    // Handle different AJAX actions here
    $action_type = sanitize_text_field($_POST['action_type']);
    
    switch ($action_type) {
        case 'save_items':
            // Handle saving PDF gallery items (PDFs + dividers)
            if (!current_user_can('manage_options')) {
                wp_send_json_error('Insufficient permissions');
            }
            
            $items_json = stripslashes($_POST['items']);
            $items = json_decode($items_json, true);
            
            if (json_last_error() === JSON_ERROR_NONE && is_array($items)) {
                update_option('pdf_gallery_data', $items);
                wp_send_json_success('PDF gallery items saved successfully');
            } else {
                wp_send_json_error('Invalid PDF gallery data');
            }
            break;
            
        case 'get_items':
            // Handle getting PDF gallery items
            $items = get_option('pdf_gallery_data', array());
            wp_send_json_success(array('items' => $items));
            break;
            
        case 'upload_pdf':
            // Handle PDF file upload
            if (!current_user_can('manage_options')) {
                wp_send_json_error('Insufficient permissions');
            }
            
            if (!isset($_FILES['pdf_file'])) {
                wp_send_json_error('No file uploaded');
            }
            
            $file = $_FILES['pdf_file'];
            
            // Check if it's a PDF file
            if ($file['type'] !== 'application/pdf') {
                wp_send_json_error('Only PDF files are allowed');
            }
            
            // Check file size (limit to 10MB)
            if ($file['size'] > 10 * 1024 * 1024) {
                wp_send_json_error('File size too large. Maximum 10MB allowed.');
            }
            
            // Handle the upload using WordPress media functions
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            
            $upload_overrides = array('test_form' => false);
            $uploaded_file = wp_handle_upload($file, $upload_overrides);
            
            if (isset($uploaded_file['error'])) {
                wp_send_json_error($uploaded_file['error']);
            }
            
            // Create attachment
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
            
            // Generate attachment metadata
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $uploaded_file['file']);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            
            wp_send_json_success(array(
                'url' => $uploaded_file['url'],
                'attachment_id' => $attachment_id,
                'filename' => basename($uploaded_file['file'])
            ));
            break;
            
        default:
            wp_send_json_error('Invalid action');
    }
}
?>