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
    { key: "atk",   idSupported: 'input#atkFilterSupported',    source: atkSupportUnits,    updateCallback: updateAtkTable, tagify: null, },
    { key: "hp",    idSupported: 'input#hpFilterSupported',     source: hpSupportUnits,     updateCallback: updateHpTable, tagify: null, },
    { key: "rcv",   idSupported: 'input#rcvFilterSupported',    source: rcvSupportUnits,    updateCallback: updateRcvTable, tagify: null, },
    { key: "other", idSupported: 'input#otherFilterSupported',  source: otherSupportUnits,  updateCallback: updateOthersTable, tagify: null, },
];

const isEmptyArray = array => array == null || array.length == null || array.length === 0;
const containsIgnoreCase = (sentence, word) => sentence.toLowerCase().indexOf(word) >= 0;

function getFilteredBySupported(array, tags) {
    if (isEmptyArray(array) || isEmptyArray(tags)) {
        return array;
    }

    return array.filter(unit =>
        unit.support.Characters &&
        tags.some(tag => containsIgnoreCase(unit.support.Characters, tag.value.toLowerCase()))
    );
}

function getFilteredBySupportEffect(array, tags) {
    if (isEmptyArray(array) || isEmptyArray(tags)) {
        return array;
    }

    const values = tags.map(t => t.value.toLowerCase());
    return array.filter(unit =>
        unit.support.description &&
        unit.support.description[4] &&
        values.every(v => containsIgnoreCase(unit.support.description[4], v))
    );
}

function getFilteredByAllFilters(array, supportedTagify) {
    let filtered = array;
    filtered = getFilteredBySupported(filtered, supportedTagify.value);
    filtered = getFilteredBySupportEffect(filtered, effectTagify.value);
    return filtered;
}

function filterBySupportEffect() {
    const tagify = filterItems.find(i => i.key === 'other').tagify;
    const filtered = getFilteredByAllFilters(otherSupportUnits, tagify);
    updateOthersTable(filtered);
}

const suggestedTags = ["Despair", "Bind", "Paralysis", "ATK Down", "Silence", "Special Rewind", "Chain Coefficient Reduction", "Chain Multiplier Limit", "Block", "Increased Defense", "Percent Damage", "Threshold", "Boosts ATK", "Amplifies", "Color Affinity", "Delayed", "Additional Damage", "Poison", "Recovers", "Adventure", "Final Stage", "Special"];
const effectTagify = new Tagify(document.querySelector('#otherFilterSupportEffect'), {
    whitelist: suggestedTags,
    maxTags: 10,
    dropdown: {
        maxItems: suggestedTags.length,           // <- maximum allowed rendered suggestions
        classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
        enabled: 0,             // <- show suggestions on focus
        closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
    }
});

effectTagify
    .on('add', e => filterBySupportEffect())
    .on('remove', e => filterBySupportEffect())
    ;

function filterAndUpdate(item) {
    const filtered = getFilteredByAllFilters(item.source, item.tagify);
    item.updateCallback(filtered);
}

filterItems.forEach(item => {
    item.tagify = new Tagify(document.querySelector(item.idSupported), {
        whitelist: [ 'luffy', 'free spirit', 'psy', ],
        maxTags: 10,
        dropdown: {
            classname: "tags-look",
            enabled: 0,
            closeOnSelect: false
        }
    });
    item.tagify
        .on('add', e => filterAndUpdate(item))
        .on('remove', e => filterAndUpdate(item))
        ;
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
        return { key: 'error', idSupported: '',  source: [],  updateCallback: (arr) => {} };
    }

    return record;
}

$('.sortable').on('click', function(e) {
    const desc = $(this).data('sortOrder');
    const origin = $(this).data('source') || '';
    const sortField = $(this).data('field') || '';

    const { idSupported, source, updateCallback } = getSourceArrayAndCallback(origin);

    // we sort the original array directly
    // if we want to preserve the original array we could do
    // const sorted = [...source].sort(getComparator(sortField, !desc));
    source.sort(getComparator(sortField, !desc));

    const filtered = getFilteredByAllFilters(source, $(idSupported).val());

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
            let supported = unit.support.Characters;
            Array.from(supported.matchAll(/\[([A-Z]+)\]/gi)).forEach(match => supported = supported.replace(match[0],'<span class="badge text-monospace badge-pill ' + match[1] + '">' + match[1] + '</span>'));
            const newRowContent = $(
            `<tr>
                <td class="text-nowrap"><a target="_blank" href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td><span class="badge text-monospace ${unit.type}">${unit.type}</span> ${unit.name}</td>
                <td class="text-nowrap">${unit[maxBoost]} (${Math.round(unit[maxBoost] + (100 * ccMultiplier) * unit.lvl5percentage)})</td>
                <td class="text-nowrap">${unit[limitBoost]} (${Math.round(unit[limitBoost] + (100 * ccMultiplier) * unit.lvl5percentage)})</td>
                <td class="text-nowrap">${unit[limitExBoost]} (${Math.round(unit[limitExBoost] + (100 * ccMultiplier) * unit.lvl5percentage)})</td>
                <td>${supported}</td>
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
            let lvl5description = unit.support.description[4];
            Array.from(lvl5description.matchAll(/\[([A-Z]+)\]/gi)).forEach(match => lvl5description = lvl5description.replace(match[0],'<span class="badge text-monospace badge-pill ' + match[1] + '">' + match[1] + '</span>'));
            let supported = unit.support.Characters;
            Array.from(supported.matchAll(/\[([A-Z]+)\]/gi)).forEach(match => supported = supported.replace(match[0],'<span class="badge text-monospace badge-pill ' + match[1] + '">' + match[1] + '</span>'));
            const newRowContent = $(
            `<tr>
                <td class="text-nowrap"><a target="_blank" href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td><span class="badge text-monospace ${unit.type}">${unit.type}</span> ${unit.name}</td>
                <td>${lvl5description}</td>
                <td class="">${supported}</td>
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

const atkMatcherName = 'Passive Base ATK Boost';
const hpMatcherName = 'Passive Base HP Boost';
const rcvMatcherName = 'Passive Base RCV Boost';

const supportMatchers = window.matchers.support;
const statMatchers = supportMatchers['Boost Damage and Stats'];

function regexOrFallback(matchers, name, fallback) {
    const result = matchers[name];
    if (result && result.regex) return result.regex;
    return fallback;
}
const atkRegex = regexOrFallback(statMatchers, atkMatcherName, /Adds.+%.+ATK/i);
const hpRegex = regexOrFallback(statMatchers, hpMatcherName, /Adds.+%.+HP/i);
const rcvRegex = regexOrFallback(statMatchers, rcvMatcherName, /Adds.+%.+RCV/i);

const matcherNamesToIgnore = [
    'Has Support Ability',
    atkMatcherName,
    hpMatcherName,
    rcvMatcherName,
    // 'Damage Reduction - Passive: Percentage', // uncomment to hide passive dmg reduc supports only
];

const otherMatchers = [];
for (const sm in supportMatchers) {
    for (const sub in supportMatchers[sm]) {
        if (matcherNamesToIgnore.includes(sub)) {
            continue;
        }
        const matcher = supportMatchers[sm][sub];
        if (!matcher.regex) continue;
        otherMatchers.push(matcher);
    }
}

window.Utils.parseUnits(false);

for (var i = 0; i < window.units.length; i++){
    const details = window.details[i+1];
    if (!details || !Array.isArray(details.support) || !details.support.length || window.units[i].incomplete){
        continue;
    }
    var unit = window.units[i];
    var lvl5support = details.support[0].description[4];
    var matched = false;
    if (lvl5support.match(atkRegex) && !lvl5support.match(/Additional/)){
        matched = true;
        atkSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/i);

        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.atkBoost = Math.round(unit.maxATK * unit.lvl5percentage);
        unit.atkBoostLimit = Math.round(unit.limitATK * unit.lvl5percentage);
        unit.atkBoostLimitEx = Math.round(unit.limitexATK * unit.lvl5percentage);
    }
    if (lvl5support.match(hpRegex)){
        matched = true;
        hpSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/i);

        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.hpBoost = Math.round(unit.maxHP * unit.lvl5percentage);
        unit.hpBoostLimit = Math.round(unit.limitHP * unit.lvl5percentage);
        unit.hpBoostLimitEx = Math.round(unit.limitexHP * unit.lvl5percentage);
    }
    if (lvl5support.match(rcvRegex)){
        matched = true;
        rcvSupportUnits.push(unit);
        var tmpMatch = lvl5support.match(/Adds ([0-9]+)[%]/i);

        unit.lvl5percentage = tmpMatch[1]/100.0;
        unit.rcvBoost = Math.round(unit.maxRCV * unit.lvl5percentage);
        unit.rcvBoostLimit = Math.round(unit.limitRCV * unit.lvl5percentage);
        unit.rcvBoostLimitEx = Math.round(unit.limitexRCV * unit.lvl5percentage);
    }

    if (!matched) {
      otherSupportUnits.push(unit);
    } else {
      for (let i = 10; i < otherMatchers.length; i++) {
          if (lvl5support.match(otherMatchers[i].regex)) {
            otherSupportUnits.push(unit);
            break;
          }
      }
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
