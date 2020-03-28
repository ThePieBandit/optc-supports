const themeKey = 'theme';
const darkValue = 'dark';
const whileValue = 'white';
const darkClass = 'dark';
const darkTableClass = 'table-dark';

function switchToDark() {
    $('body').addClass(darkClass);
    $('.table').addClass(darkTableClass);
    $('.nav-tabs').addClass('bg-dark');
    $('.nav-link').addClass('text-light');
    $('#theme')
        .addClass('fa-sun-o')
        .removeClass('fa-moon-o')
        ;
    localStorage.setItem(themeKey, darkValue);
}

function switchFromDark() {
    $('body').removeClass(darkClass);
    $('.table').removeClass(darkTableClass);
    $('.nav-tabs').removeClass('bg-dark');
    $('.nav-link').removeClass('text-light');
    $('#theme')
        .addClass('fa-moon-o')
        .removeClass('fa-sun-o')
        ;
    localStorage.setItem(themeKey, whileValue);
}

$(document).ready(function() {
    const theme = localStorage.getItem(themeKey);
    let darkOn = theme === darkValue;
    if (darkOn) {
        switchToDark();
    }

    $('#theme').on('click', function(e) {
        darkOn = !darkOn;
        if (darkOn) {
            switchToDark();
        } else {
            switchFromDark();
        }
    });
});