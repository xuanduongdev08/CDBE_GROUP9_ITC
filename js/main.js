(function ($) {
    "use strict";

    // Function to update cart icon with count
    window.updateCartIcon = function(cartCount, cartTotal) {
        // Find the cart link by searching for the fa-shopping-cart icon
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon && cartIcon.parentElement && cartIcon.parentElement.classList.contains('position-relative')) {
            const cartLink = cartIcon.parentElement;
            
            // Remove existing badge
            const existingBadge = cartLink.querySelector('.badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // Add new badge if count > 0
            if (cartCount > 0) {
                const badge = document.createElement('span');
                badge.className = 'position-absolute badge rounded-pill bg-warning';
                badge.style.cssText = 'top: -5px; right: -5px; font-size: 0.65rem; padding: 0.2em 0.4em; min-width: 18px; line-height: 1; color: #000;';
                badge.textContent = cartCount > 99 ? '99+' : cartCount;
                cartLink.appendChild(badge);
            }
        }
        
        // Update cart total
        const cartTotalEl = document.getElementById('cart-total');
        if (cartTotalEl && cartTotal) {
            cartTotalEl.textContent = new Intl.NumberFormat('vi-VN').format(cartTotal) + ' VNĐ';
        }
    };

    // Spinner
    var spinner = function () {
        if ($('#spinner').length > 0) {
            $('#spinner').removeClass('show');
        }
    };
    
    // Remove spinner on load
    $(document).ready(function() {
        spinner();
    });
    
    // Also remove on window load
    $(window).on('load', function() {
        spinner();
        if ($('#spinner').length > 0) {
            $('#spinner').hide();
        }
    });
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
            $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
    });


    // Hero Header carousel
    $(".header-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: false,
        loop: true,
        margin: 0,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ]
    });


    // ProductList carousel
    $(".productList-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        dots: false,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:2
            },
            1200:{
                items:3
            }
        }
    });

    // ProductList categories carousel
    $(".productImg-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: false,
        loop: true,
        items: 1,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ]
    });


    // Single Products carousel
    $(".single-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        dotsData: true,
        loop: true,
        items: 1,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ]
    });


    // ProductList carousel
    $(".related-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: false,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });



    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });


    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


   

})(jQuery);

