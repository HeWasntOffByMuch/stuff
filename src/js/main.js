$(window).scroll(function() {
    if ($("header").offset().top > 50) {
        $("header").removeClass("scrolled-top");
        $('#header-logo').removeClass('scrolled-top');
        $('#header-logo-text').removeClass('scrolled-top');
    } else {
        $("header").addClass("scrolled-top");
        $('#header-logo').addClass('scrolled-top');
        $('#header-logo-text').addClass('scrolled-top');
    }
});
