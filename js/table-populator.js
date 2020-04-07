if (!window.jQuery) {
    throw new Error("Need jQuery to work...");
}

const arrowDown = 'fa-long-arrow-down';
const arrowUp = 'fa-long-arrow-up';
const arrowBoth = 'fa-arrows-v';
const atkSupportUnits = [];
const hpSupportUnits = [];
const rcvSupportUnits = [];
const otherSupportUnits = [];
const debounceMs = 500;

let debounce = null;

const filterItems = [
    { key: "atk",   id: 'input#atkFilter',    source: atkSupportUnits,    updateCallback: updateAtkTable },
    { key: "hp",    id: 'input#hpFilter',     source: hpSupportUnits,     updateCallback: updateHpTable },
    { key: "rcv",   id: 'input#rcvFilter',    source: rcvSupportUnits,    updateCallback: updateRcvTable },
    { key: "other", id: 'input#otherFilter',  source: otherSupportUnits,  updateCallback: updateOthersTable },
];

function getFilteredBySupported(array, value) {
    if (value == null || value === '') {
        return array;
    }

    if (array == null || array.length === 0) {
        return array;
    }

    const lcValue = value.toLowerCase();
    return array.filter(unit =>
        unit.support.Characters &&
        unit.support.Characters.toLowerCase().indexOf(lcValue) >= 0
    );
}

filterItems.forEach(item => {
    $(item.id).on('keyup', function(e) {
        clearTimeout(debounce);
        const value = $(this).val();
        debounce = setTimeout(function() {
            const filtered = getFilteredBySupported(item.source, value);
            item.updateCallback(filtered);
       }, debounceMs);
    });
});

function getComparator(sortField, asc) {
    const multiplier = asc ? 1 : -1;
    switch (sortField) {
        case 'name':
            return (a, b) => b.name.localeCompare(a.name) * multiplier;

        case 'id':
        case 'atkBoost':
        case 'atkBoostLimit':
        case 'atkBoostLimitEx':
        case 'hpBoost':
        case 'hpBoostLimit':
        case 'hpBoostLimitEx':
        case 'rcvBoost':
        case 'rcvBoostLimit':
        case 'rcvBoostLimitEx':
            return (a, b) => (b[sortField] - a[sortField]) * multiplier;

        default:
            console.error('unexpected sortField', sortField);
            return (a, b) => 1;
    }
}

function getSourceArrayAndCallback(source) {
    const record = filterItems.find(table => table.key == source)
    if (record == null) {
        console.error('unexpected data-source on .sortable element');
        return { key: 'error', id: '',  source: [],  updateCallback: (arr) => {} };
    }

    return record;
}

$('.sortable').on('click', function(e) {
    const desc = $(this).data('sortOrder');
    const origin = $(this).data('source') || '';
    const sortField = $(this).data('field') || '';
    
    const { id, source, updateCallback } = getSourceArrayAndCallback(origin);
    
    // we sort the original array directly
    // if we want to preserve the original array we could do
    // const sorted = [...source].sort(getComparator(sortField, !desc));
    source.sort(getComparator(sortField, !desc));
    
    const value = $(id).val();
    const filtered = getFilteredBySupported(source, value);

    updateCallback(filtered);
    
    const classToAdd = desc ? arrowUp : arrowDown;

    // reset all sortable elements
    $('.sortable').data('sortOrder', null);
    $('.sortable').find('i')
        .removeClass(arrowDown)
        .removeClass(arrowUp)
        .addClass(arrowBoth);

    // update only this sortable element
    $(this).data('sortOrder', !desc);
    $(this).find('i')
        .removeClass('fa-arrows-v')
        .addClass(classToAdd);
});

function writeStatTable(elementId, source, maxBoost, limitBoost, limitExBoost, ccMultiplier) {
    const tbody = $(`#${elementId} tbody`);
    tbody.empty();
    for (var i = 0; i < source.length; i++) {
        try {
            const unit = source[i];
            const newRowContent = $(
            `<tr>
                <td><a target="_blank" href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td>${unit.name}</td>
                <td>${unit[maxBoost]}/${Math.round(unit[maxBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit[limitBoost]}/${Math.round(unit[limitBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit[limitExBoost]}/${Math.round(unit[limitExBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit.support.Characters}</td>
            </tr>`);
            tbody.append(newRowContent);
        } catch (err) {
            console.error(err); 
        }
    }
}

function writeOtherTable(elementId, source) {
    const tbody = $(`#${elementId} tbody`);
    tbody.empty();
    for (var i = 0; i < source.length; i++) {
        try {            
            const unit = source[i];
            const newRowContent = $(
            `<tr>
                <td><a target="_blank" href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td>${unit.name}</td>
                <td>${unit.support.description[4]}</td>
                <td>${unit.support.Characters}</td>
            </tr>`);
            tbody.append(newRowContent);
        }
        catch (err) {
            console.error(err);
        }
    }
    return i;
}

function updateAtkTable(source) {
    writeStatTable("atkSupportUnits", source, "atkBoost", "atkBoostLimit", "atkBoostLimitEx", 2);
}

function updateHpTable(source) {
    writeStatTable("hpSupportUnits", source, "hpBoost", "hpBoostLimit", "hpBoostLimitEx", 5);
}

function updateRcvTable(source) {
    writeStatTable("rcvSupportUnits", source, "rcvBoost", "rcvBoostLimit", "rcvBoostLimitEx", 1);
}

function updateOthersTable(source) {
    writeOtherTable("otherSupportUnits", source);
}

const matchers = window.matchers.filter(matcher => matcher.target == "support");
window.Utils.parseUnits(false);
 
for (var i = 0; i < window.units.length; i++){
    if(!window.details[i+1] || !window.details[i+1].support || window.units[i].incomplete){
        continue;
    }
    var unit = window.units[i];
    var lvl5support = window.details[i+1].support[0].description[4];
    var matched = false;
    if (lvl5support.match(matchers.filter(matcher => matcher.name == "ATK Boosting Support")[0].matcher) && !lvl5support.match(/Additional/)){
        matched = true;
        atkSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/);
        
        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.atkBoost = Math.round(unit.maxATK * unit.lvl5percentage);
        unit.atkBoostLimit = Math.round(unit.limitATK * unit.lvl5percentage);
        unit.atkBoostLimitEx = Math.round(unit.limitexATK * unit.lvl5percentage);
    }
    if (lvl5support.match(matchers.filter(matcher => matcher.name == "HP Boosting Support")[0].matcher)){
        matched = true;
        hpSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/);
        
        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.hpBoost = Math.round(unit.maxHP * unit.lvl5percentage);
        unit.hpBoostLimit = Math.round(unit.limitHP * unit.lvl5percentage);
        unit.hpBoostLimitEx = Math.round(unit.limitexHP * unit.lvl5percentage);
    }
    if (lvl5support.match(matchers.filter(matcher => matcher.name == "RCV Boosting Support")[0].matcher)){
        matched = true;
        rcvSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/);
        
        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.rcvBoost = Math.round(unit.maxRCV * unit.lvl5percentage);
        unit.rcvBoostLimit = Math.round(unit.limitRCV * unit.lvl5percentage);
        unit.rcvBoostLimitEx = Math.round(unit.limitexRCV * unit.lvl5percentage);
    }
    
    if (!matched) {
        otherSupportUnits.push(unit);
    }
    unit.support = window.details[i+1].support[0];
    unit.id = i+1;   
}

atkSupportUnits.sort( (a,b) => b.atkBoostLimit - a.atkBoostLimit);

hpSupportUnits.sort( (a,b) => b.hpBoostLimit - a.hpBoostLimit);

rcvSupportUnits.sort( (a,b) => b.rcvBoostLimit - a.rcvBoostLimit);

updateAtkTable(atkSupportUnits);
updateHpTable(hpSupportUnits);
updateRcvTable(rcvSupportUnits);
updateOthersTable(otherSupportUnits);
