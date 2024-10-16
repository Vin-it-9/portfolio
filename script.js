let eventBoxes = document.querySelectorAll(".flip-card-container-clickable");
var x;
var $cards = $(".flip-card-container");
var $style = $(".hover");
VanillaTilt.init(eventBoxes, {
    max: 32,
    speed: 2500,
});

eventBoxes.forEach(function (eventBox) {
    eventBox.addEventListener('mousemove', function (event) {
        var pos = [event.offsetX, event.offsetY];
        event.preventDefault();
        if (event.type === "touchmove") {
            pos = [event.touches[0].clientX, event.touches[0].clientY];
        }

        var $card = $(this);
        var l = pos[0];
        var t = pos[1];
        var h = $card.height();
        var w = $card.width();
        var px = Math.abs(Math.floor(100 / w * l) - 100);
        var py = Math.abs(Math.floor(100 / h * t) - 100);

        var pa = (50 - px) + (50 - py);
        var lp = (50 + (px - 50) / 1.5);
        var tp = (50 + (py - 50) / 1.5);
        var px_spark = (50 + (px - 50) / 7);
        var py_spark = (50 + (py - 50) / 7);
        var p_opc = 20 + (Math.abs(pa) * 1.5);
        var ty = ((tp - 50) / 2) * -1;
        var tx = ((lp - 50) / 1.5) * .5;
        var grad_pos = `background-position: ${lp}% ${tp}%;`
        var sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`
        var opc = `opacity: ${p_opc/50};`

        $cards.removeClass("active");
        $card.removeClass("animated");
        $style.html(style);

        clearTimeout(x);
    });

    eventBox.addEventListener('mouseout', function (event) {
        var $card = $(event.target).closest('.flip-card-container');
        var $front = $card.find('.flip-card-front');
        $style.html("");
        $card.removeAttr("style");
        x = setTimeout(function () {
          $front.addClass("animated");
        }, 2500);
      });
});

AOS.init({
    offset: 240,
    delay: 50,
    duration: 350,
    once: false,  
    mirror: false,
    anchorPlacement: 'top-bottom',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
});

function scrollDown() {
    window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
}
