const themeKey = 'theme';
const darkValue = 'dark';
const whiteValue = 'white';
const themeButtonSelector = '#theme';

const whiteModeClasses = [
    { selector: '#theme', class: 'fa-moon-o' },
];

const darkModeClasses = [
    { selector: 'body', class: 'dark' },
    { selector: '.table', class: 'table-dark' },
    { selector: '.nav-tabs', class: 'bg-dark' },
    { selector: '.nav-link', class: 'text-light' },
    { selector: themeButtonSelector, class: 'fa-sun-o' },
];

function applyTheme(pairsToRemove, pairsToAdd, themeValue) {
    pairsToRemove.forEach(pair => {
        $(pair.selector).removeClass(pair.class);
    });
    pairsToAdd.forEach(pair => {
        $(pair.selector).addClass(pair.class);
    });
    localStorage.setItem(themeKey, themeValue);
}

function switchToDark() {
    applyTheme(whiteModeClasses, darkModeClasses, darkValue);
}

function switchFromDark() {
    applyTheme(darkModeClasses, whiteModeClasses, whiteValue);
}

$(document).ready(function() {
    const theme = localStorage.getItem(themeKey);
    let darkOn = theme === darkValue;
    if (darkOn) {
        switchToDark();
    }

    $(themeButtonSelector).on('click', function(e) {
        darkOn = !darkOn;
        if (darkOn) {
            switchToDark();
        } else {
            switchFromDark();
        }
    });
});
