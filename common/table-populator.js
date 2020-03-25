if (!window.jQuery) {
    throw new Error("Need jQuery to work...");
}

function writeStatTable(elementId, source, maxBoost, limitBoost, limitExBoost, ccMultiplier) {
    for (var i = 0; i < source.length; i++){
        try {
            const unit = source[i];
            const newRowContent = $(
            `<tr>
                <td><a href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td>${unit.name}</td>
                <td>${unit[maxBoost]}/${Math.round(unit[maxBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit[limitBoost]}/${Math.round(unit[limitBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit[limitExBoost]}/${Math.round(unit[limitExBoost] + (100 * ccMultiplier) * unit.lvl5percentage)}</td>
                <td>${unit.support.Characters}</td>
            </tr>`);
            $(`#${elementId} tbody`).append(newRowContent);
        } catch (err) {
            console.error(err); 
        }
    }
}

function writeOtherTable(elementId, source) {
    for (var i = 0; i < source.length; i++) {
        try {            
            const unit = source[i];
            const newRowContent = $(
            `<tr>
                <td><a href="http://optc-db.github.io/characters/#/view/${unit.id}">${unit.id}</a></td>
                <td>${unit.name}</td>
                <td>${unit.support.description[4]}</td>
                <td>${unit.support.Characters}</td>
            </tr>`);
            $(`#${elementId} tbody`).append(newRowContent);            
        }
        catch (err) {
            console.error(err);
        }
    }
    return i;
}

const matchers = window.matchers.filter(matcher => matcher.target == "support");
window.Utils.parseUnits(false);

const atkSupportUnits = [];
const hpSupportUnits = [];
const rcvSupportUnits = [];
const otherSupportUnits = [];
 
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

writeStatTable("atkSupportUnits", atkSupportUnits, "atkBoost", "atkBoostLimit", "atkBoostLimitEx", 2);
writeStatTable("hpSupportUnits", hpSupportUnits, "hpBoost", "hpBoostLimit", "hpBoostLimitEx", 5);
writeStatTable("rcvSupportUnits", rcvSupportUnits, "rcvBoost", "rcvBoostLimit", "rcvBoostLimitEx", 1);
writeOtherTable("otherSupportUnits", otherSupportUnits);
