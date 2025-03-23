(function ($, window, document, undefined) {
  var $win = $(window);
  $(function () {
    $('.list-count').on('click', 'a', function (event) {
      event.preventDefault();
      var $this = $(this);
      var $qtyField = $this.closest('.list-count').find('.qty-field');
      var fieldVal = parseInt($qtyField.val(), 10) || 0;
      var min = $qtyField.attr('min');
      var max = $qtyField.attr('max');
      if ($this.hasClass('qty-less')) {
        if (fieldVal != min) {
          fieldVal--;
        }
      } else {
        if (fieldVal < max) {
          fieldVal++;
        }
      }
      $qtyField.val(fieldVal);
    });

    jQuery('.slider-products .slider__slides ul')
      .first()
      .slick({
        waitForAnimate: !1,
        infinite: !0,
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: !1,
        responsive: [
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
        ],
      });

    $('.slider-products-alt .slider__slides ul').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
    });
    $('.apresentacao .ul.thumbs').slick({
      slidesToShow: 4,
      slidesToScroll: 0,
      centerMode: !1,
      vertical: !0,
      focusOnSelect: !1,
      accessibility: !1,
      asNavFor: '.slider-product .slider__slides',
      responsive: [
        {
          breakpoint: 768,
          settings: 'unslick',
        },
      ],
    });

    $('.slider-products-alt .slider__slides ul').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
    });
    $('.apresentacao .ul.thumbs').slick({
      slidesToShow: 4,
      slidesToScroll: 0,
      centerMode: !1,
      vertical: !0,
      focusOnSelect: !1,
      accessibility: !1,
      asNavFor: '.slider-product .slider__slides',
      responsive: [
        {
          breakpoint: 768,
          settings: 'unslick',
        },
      ],
    });
    $('.slider-product .slider__slides').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
    });
    $('.slider-products-secondary .slider__slides ul').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
    });
    $('ul.thumbs li').on('click', function (event) {
      $('#include #image').slick('slickGoTo', $(this).data('slickIndex'));
    });
    var maxHeight = 0;
    $('.slider-products ul li').each(function () {
      var height = $(this).outerHeight();
      maxHeight = maxHeight > height ? maxHeight : height;
    });
    $('.slider-products ul li').css('height', maxHeight);
    maxHeight = 0;
    $('.slider-products-alt ul li').each(function () {
      var height = $(this).outerHeight();
      maxHeight = maxHeight > height ? maxHeight : height;
    });
    $('.slider-products-alt ul li').css('height', maxHeight);
    $('.nav__body li').each(function () {
      $(this).find('>ul').parent().addClass('has-dropdown').append('<span class="dropdown-trigger"></span>');
    });
    $('.nav').on('click', '.dropdown-trigger', function (event) {
      var $this = $(this);
      var $parent = $this.parent();
      $parent
        .find('> ul')
        .addClass('visible')
        .end()
        .addClass('expanded')
        .siblings()
        .removeClass('expanded')
        .find('> ul')
        .removeClass('visible');
      $parent.find('> ul > .back').on('click', function (e) {
        e.preventDefault();
        $(this).parent().parent().removeClass('expanded');
      });
    });
    $('.item__btn').on('click', function (e) {
      e.preventDefault();
      $(this).parent().addClass('checked');
    });

    $('.ape-search-result__back-to-top').on('click', function (e) {
      e.preventDefault();
      $('body,html').animate(
        {
          scrollTop: 0,
        },
        1000
      );
    });
    $('.accordion .accordion__head').on('click', function () {
      $(this).parent().toggleClass('active');
    });
    $('.accordion-product .accordion__head').on('click', function () {
      $(this).parent().addClass('active').siblings().removeClass('active');
    });
    $('.tabs .tabs__nav .radio-secondary input').on('click', function () {
      var $target = $($(this).parent().data('target'));
      var $this = $(this);
      $this.closest('li').addClass('active').siblings().removeClass('active');
      $target.addClass('active').siblings().removeClass('active');
    });

    function removeBtn() {
      const interval = setInterval(() => {
        let removeButton = $('.vtex-account__order-details ul.list');
        if (removeButton.length >= 1) {
          clearInterval(interval);
          removeButton.children()[1].remove();
        }
      }, 1000);
    }

    window.onhashchange = removeBtn;
    window.onload = removeBtn;

    function filterPopup() {
      if ($win.outerWidth() < 768) {
        $('.section-products .section__content .btn-danger').on('click', function (e) {
          e.preventDefault();
          $('.section-products .section__aside').addClass('active');
          $('.section-products .section__aside h4 .ico-close-white').on('click', function () {
            $('.section-products .section__aside').removeClass('active');
          });
        });
      }
    }
    filterPopup();
  });
})(jQuery, window, document);
