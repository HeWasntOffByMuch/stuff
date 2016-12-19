// $(window).scroll(function() {
//     if ($("#header").offset().top > 50) {
//         $("#header").removeClass("scrolled-top");
//         $('#header-logo').removeClass('scrolled-top');
//         $('#header-logo-text').removeClass('scrolled-top');
//     } else {
//         $("#header").addClass("scrolled-top");
//         $('#header-logo').addClass('scrolled-top');
//         $('#header-logo-text').addClass('scrolled-top');
//     }
// });

$(document).ready(function() {
    var parallax = new Parallax(document.getElementById('scene1'));
    parallax.calibrate(true, true);

    console.log('width', window.screen.width)

    $('#fullpage').fullpage({
        //Navigation
        menu: '#menu',
        lockAnchors: false,
        anchors:['firstPage', 'secondPage', 'thirdPage'],
        navigation: true,
        navigationPosition: 'right',
        navigationTooltips: ['firstSlide', 'secondSlide'],
        showActiveTooltip: false,
        slidesNavigation: true,
        slidesNavPosition: 'bottom',

        //Scrolling
        css3: true,
        scrollingSpeed: 475,
        autoScrolling: true,
        fitToSection: true,
        fitToSectionDelay: 1000,
        scrollBar: false,
        easing: 'easeInOutCubic',
        easingcss3: 'ease',
        loopBottom: false,
        loopTop: false,
        loopHorizontal: true,
        continuousVertical: false,
        continuousHorizontal: false,
        scrollHorizontally: false,
        interlockedSlides: false,
        dragAndMove: true,
        offsetSections: false,
        resetSliders: false,
        fadingEffect: false,
        normalScrollElements: '#element1, .element2',
        scrollOverflow: false,
        scrollOverflowOptions: null,
        touchSensitivity: 15,
        normalScrollElementTouchThreshold: 5,
        bigSectionsDestination: null,

        //Accessibility
        keyboardScrolling: true,
        animateAnchor: true,
        recordHistory: true,

        //Design
        controlArrows: true,
        verticalCentered: true,
        sectionsColor : ['#ccc', '#fff'],
        paddingTop: '0',
        paddingBottom: '0',
        fixedElements: '#header, .footer',
        responsiveWidth: 0,
        responsiveHeight: 0,
        responsiveSlides: false,

        //Custom selectors
        sectionSelector: '.section',
        slideSelector: '.slide',

        lazyLoading: true,

        //events
        onLeave: function(index, nextIndex, direction){
            if(index == 1 && direction =='down'){
                $("#header").removeClass("scrolled-top");
                $('#header-logo').removeClass('scrolled-top');
                $('#header-logo-text').removeClass('scrolled-top');
            } else if(nextIndex === 1 && direction == 'up'){
                $("#header").addClass("scrolled-top");
                $('#header-logo').addClass('scrolled-top');
                $('#header-logo-text').addClass('scrolled-top');
            }
        },
        afterLoad: function(anchorLink, index){},
        afterRender: function(){},
        afterResize: function(){},
        afterResponsive: function(isResponsive){},
        afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
        onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex){}
    });
});


