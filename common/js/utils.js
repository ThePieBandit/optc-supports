(function () {

    var FODDER_REGEX = new RegExp('(' + [
        'Group', 'Ensign Navy HQ', 'Armed \\w+ Unit', '[BM]illions Baroque', 'Eneru\'s Elect',
        'Skypiea (Guard|Enforcer)', '(Adept|Nomad|Hunter), Shandian',
        '(Seaman|Major|Corporal) Navy', 'Hoodlum.+Bounty Hunter', 'Punk Black Cat Pirates',
        'Arlong crewmember', 'Gunner|Cannoneer|Assassin Master', '^(Female|Giant).*(Red|Blue|Green|Yellow|Black) Pirates',
        '(Soldier|General) Zombie.*Shadow', 'Wild Zombie', 'Street Punk', 'Kuja Warriors', '(Naginata|Rifle|Saber|Bazooka|Knuckle) (Corporal|Major)', '(Strong|Speedy|Crafty|Hate-Filled|Egotistical) Soldier Zombie', '(Powerful|Sneaky|Blazing) General Zombie', '(Quick-Draw|Scheming|Technical|Quick-Strike|Strong-Arm|Bold) Gunman', '(Suppressor|Emergency|Perimeter) Jailer', '(Contemplative|All-Action) Guard', 'Fishman (Guard|Outlaw)', 'Punk Hazard Gas Mask Patrol Soldier', 'Punk Hazard Patrol Troop Corps', 'Donquixote Pirates Member', '(Tactical|Elite) Musketeers', '(Fighter Group|Reconnaissance Group|Electro Group), Guardians', 'Germa Kingdom Clone Soldier', 'Soul Homie', 'Chess Mercenaries', 'Wano Country Official'
    ].join(')|(') + ')', 'i');

    var utils = {};

    var fullNames = null, reverseEvoMap = null;

    /* * * * * Unit control * * * * */

    var parseUnit = function (element, n) {
        var piratefest = window.festival[n];
        if (element.length === 0)
            return [];
        if (element[15] && element[15].constructor != Array)
            element[15] = [element[15], element[15], element[15]];
        var limitHealth = element[12], limitAttack = element[13], limitRecovery = element[14], limitCooldown = 0, limitSlots = element[6];
        var limitexHealth = element[12], limitexAttack = element[13], limitexRecovery = element[14], limitexCooldown = 0, limitexSlots = element[6];
        var keylevel = 0;
        var LBhp = [], LBatk = [], LBrcv = [], LBsailor = [ 0 ], LBcaptain = [ 0 ];
        var LBhptotal = 0, LBatktotal = 0, LBrcvtotal = 0, LBsailors = 0, LBcaptains = 0;
        if (window.details) if(window.details[n + 1]) if(window.details[n + 1].limit){
            keylevel = Object.keys(window.details[n + 1].limit).length;
            for(var x in window.details[n + 1].limit) if (window.details[n + 1].limit[x].description.includes("LOCKED WITH KEY")) keylevel = x;
            //console.log(keylevel, n+1);
            for(var x in window.details[n + 1].limit){
                if (parseInt(x) < keylevel){
                    if (window.details[n + 1].limit[x].description.includes("Boosts base HP by ")) limitHealth += parseInt(window.details[n + 1].limit[x].description.substring(18), 10);
                    if (window.details[n + 1].limit[x].description.includes("Boosts base ATK by ")) limitAttack += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    if (window.details[n + 1].limit[x].description.includes("Boosts base RCV by ")) limitRecovery += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    if (window.details[n + 1].limit[x].description.includes("Reduce base Special Cooldown by ")) limitCooldown += parseInt(window.details[n + 1].limit[x].description.substring(32, 33), 10);
                    if (window.details[n + 1].limit[x].description.includes("additional Socket slot")) limitSlots += parseInt(window.details[n + 1].limit[x].description.substring(8, 9), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base HP by ")) {
                    limitexHealth += parseInt(window.details[n + 1].limit[x].description.substring(18), 10);
                    LBhptotal += parseInt(window.details[n + 1].limit[x].description.substring(18), 10)
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base ATK by ")){
                    limitexAttack += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    LBatktotal += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base RCV by ")){
                    limitexRecovery += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    LBrcvtotal += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Reduce base Special Cooldown by ")){
                    limitexCooldown += parseInt(window.details[n + 1].limit[x].description.substring(32, 33), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("additional Socket slot")){
                    limitexSlots += parseInt(window.details[n + 1].limit[x].description.substring(8, 9), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Acquire Sailor Ability")){
                    LBsailors++;
                }
                if (window.details[n + 1].limit[x].description.includes("Acquire new Captain Ability")){
                    LBcaptains++;
                }
                LBhp.push(LBhptotal);
                LBatk.push(LBatktotal);
                LBrcv.push(LBrcvtotal);
                LBsailor.push(LBsailors);
                LBcaptain.push(LBcaptains);
            }
        }
        var result = {
            name: element[0], type: element[1],
            class: element[2], stars: element[3],
            cost: element[4], combo: element[5],
            slots: element[6], maxLevel: element[7],
            maxEXP: element[8], minHP: element[9],
            minATK: element[10], minRCV: element[11],
            maxHP: element[12], maxATK: element[13],
            maxRCV: element[14], limitHP: limitHealth, 
            limitATK: limitAttack, limitRCV: limitRecovery,
            limitSlot: limitSlots, limitCD: limitCooldown,
            limitexHP: limitexHealth, 
            limitexATK: limitexAttack, limitexRCV: limitexRecovery,
            limitexSlot: limitexSlots, limitexCD: limitexCooldown,
            growth: {
                hp: element[15] ? element[15][0] : 0,
                atk: element[15] ? element[15][1] : 0,
                rcv: element[15] ? element[15][2] : 0
            },
            number: n,
            limitStats: {
                hp: LBhp, atk: LBatk, rcv: LBrcv,
                sailors: LBsailor, captains: LBcaptain
            },
            pirateFest: {
                class: piratefest ? piratefest[0] : "",
                DEF: piratefest ? piratefest[1] : null, SPD: piratefest ? piratefest[2] : null, minCP: piratefest ? piratefest[3] : null, maxCP: piratefest ? piratefest[4] : null,
            }
        };
        if (element.indexOf(null) != -1)
            result.incomplete = true;
        if (result.combo === null)
            result.preview = true;
        return result;
    };

    utils.parseUnits = function (skipIncomplete) {
        if (skipIncomplete) {
            window.units = window.units.map(function (x, n) {
                if (x.indexOf(null) == -1)
                    return x;
                var viable = x[9] && x[10] && x[11] && x[12] && x[13] && x[14];
                return viable ? x : [];
            });
        }
        window.units = window.units.map(parseUnit);
    };

    utils.getFullUnitName = function (id) {
        if (fullNames === null) {
            fullNames = units.map(function (x, n) {
                if (!x.name)
                    return null;
                return x.name + (window.aliases[n + 1] ? ' ' + window.aliases[n + 1].join(', ') : '');
            });
        }
        return fullNames[id - 1];
    };

    /* * * * * Thumbnail control * * * * */
    
    utils.getGlobalThumbnailUrl = function (n) {
        if (n === null || n === undefined || (window.units && window.units[n - 1].incomplete))
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1');
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/sites/2/f' + id + '.png';
    };

    utils.getThumbnailUrl = function (n) {
        switch (n){
            case 'skullLuffy':
            case 9001: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_luffy.png'; break;
            case 'skullZoro':
            case 9002: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_zoro.png'; break;
            case 'skullNami':
            case 9003: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_nami.png'; break;
            case 'skullUsopp':
            case 9004: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_usopp_f.png'; break;
            case 'skullSanji':
            case 9005: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_sanji_f.png'; break;
            case 'skullChopper':
            case 9006: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_chopper_f.png'; break;
            case 'skullRobin':
            case 9007: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_robin_f.png'; break;
            case 'skullFranky':
            case 9008: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_franky_f.png'; break;
            case 'skullBrook':
            case 9009: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_brook_f.png'; break;
            case 'skullSTR':
            case 9010: return 'https://onepiece-treasurecruise.com/wp-content/uploads/red_skull_f.png'; break;
            case 'skullQCK':
            case 9011: return 'https://onepiece-treasurecruise.com/wp-content/uploads/blue_skull_f.png'; break;
            case 'skullPSY':
            case 9012: return 'https://onepiece-treasurecruise.com/wp-content/uploads/yellow_skull2_f.png'; break;
            case 'skullDEX':
            case 9013: return 'https://onepiece-treasurecruise.com/wp-content/uploads/green_skull2_f.png'; break;
            case 'skullINT':
            case 9014: return 'https://onepiece-treasurecruise.com/wp-content/uploads/black_skull_f.png'; break;
            case 'skullJudge':
            case 9015: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f1.png'; break;
            case 'skullReiju':
            case 9016: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f2.png'; break;
            case 'skullIchiji':
            case 9017: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f3.png'; break;
            case 'skullNiji':
            case 9018: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f4.png'; break;
            case 'skullYonji':
            case 9019: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f5.png'; break;
            case 'skullDoffy':
            case 9020: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_f.png'; break;
            case 'skullEnel':
            case 9021: return 'https://onepiece-treasurecruise.com/wp-content/uploads/enel_skull_f.png'; break;
            case 'skullHiguma':
            case 9022: return 'https://onepiece-treasurecruise.com/wp-content/uploads/higuma_skull_f.png'; break;
            case 'skullSanji2':
            case 9023: return 'https://onepiece-treasurecruise.com/wp-content/uploads/sanji_skull_f.png'; break;
            case 'skullFrankie':
            case 9024: return 'https://onepiece-treasurecruise.com/wp-content/uploads/frankie_skull_f.png'; break;
            case 'skullCavendish':
            case 9025: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Cavendish_skull_f.png'; break;
            case 'skullDoflamingo':
            case 9026: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_f2.png'; break;
            case 'skullIchiji2':
            case 9027: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f6.png'; break;
            case 'skullNiji2':
            case 9028: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f7.png'; break;
            case 'skullYonji2':
            case 9029: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f8.png'; break;
            case 'skullReiju2':
            case 9030: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f9.png'; break;
            case 'skullHancock':
            case 9031: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Hancock_skull_f.png'; break;
            case 'skullNami2':
            case 9032: return 'https://onepiece-treasurecruise.com/wp-content/uploads/nami_skull_f.png'; break;
            case 'skullBullet':
            case 9033: return '../res/skullBullet.png'; break;
            case 'skullKatakuri':
            case 9034: return '../res/skullKatakuri.png'; break;
            case 'skullWhitebeard':
            case 9035: return '../res/skullWhitebeard.png'; break;
            case 'skullCP9':
            case 9036: return '../res/skullCP9.png'; break;
            case 'skullRaidKaido':
            case 9037: return '../res/skullKaidoRaid.png'; break;
            case 'skullBlackbeard':
            case 9038: return '../res/skullBlackbeard.png'; break;
            case 'skullZoro2':
            case 9039: return '../res/skullZoro2.png'; break;
            case 'skullSanji2':
            case 9040: return '../res/skullSanji2.png'; break;
            case 'skullMihawk':
            case 9041: return '../res/skullMihawk.png'; break;
            case 'skullNami3':
            case 9042: return '../res/skullNamiv2.png'; break;
        }
        if (n === null || n === undefined)
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        if ((window.units && window.units[n - 1].incomplete)){
            switch (window.units[n - 1].type){
                case 'STR': return '../res/blank_str.png'; break;
                case 'DEX': return '../res/blank_dex.png'; break;
                case 'QCK': return '../res/blank_qck.png'; break;
                case 'PSY': return '../res/blank_psy.png'; break;
                case 'INT': return '../res/blank_int.png'; break;
                default: return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png'; break;
            }
        }
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1'); // missing aokiji image
        switch(id){
            case '0742': return 'https://onepiece-treasurecruise.com/wp-content/uploads/f0742-2.png'; break;
            case '3000': return 'https://onepiece-treasurecruise.com/wp-content/uploads/f3000_1.png'; break;
            //case '2262': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5011.png'; break;
            //case '2263': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5012.png'; break;
            //case '2500': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f2500.png'; break;
            //case '3080': return '../res/sadBandai/character_11669_t1.png'; break;
            //case '3081': return '../res/sadBandai/character_11506_t1.png'; break;
            //case '3085': return '../res/sadBandai/character_11668_t1.png'; break;
            //case '3086': return '../res/sadBandai/character_11505_t1.png'; break;
            //case '3087': return '../res/sadBandai/character_11707_t1.png'; break;
            //case '3088': return '../res/sadBandai/character_11708_t1.png'; break;
            //case '3089': return '../res/sadBandai/character_11709_t1.png'; break;
            //case '3090': return '../res/sadBandai/character_11086_t1.png'; break;
            //case '3091': return '../res/sadBandai/character_11087_t1.png'; break;
            //case '3092': return '../res/sadBandai/character_11088_t1.png'; break;
            //case '3093': return '../res/sadBandai/character_11089_t1.png'; break;
            //case '3094': return '../res/sadBandai/character_11710_t1.png'; break;
            //case '3095': return '../res/sadBandai/character_11409_t1.png'; break;
            //case '3096': return '../res/sadBandai/character_11705_t1.png'; break;
            //case '3097': return '../res/sadBandai/character_11711_t1.png'; break;
            //case '3098': return '../res/sadBandai/character_11714_t1.png'; break;
            //case '3099': return '../res/sadBandai/character_11715_t1.png'; break;
            //case '3100': return '../res/sadBandai/character_11716_t1.png'; break;
            //case '3101': return '../res/sadBandai/character_11717_t1.png'; break;
            //case '3102': return '../res/sadBandai/character_11718_t1.png'; break;
            //case '3103': return '../res/sadBandai/character_11719_t1.png'; break;
            //case '3104': return '../res/sadBandai/character_11720_t1.png'; break;
            //case '3105': return '../res/sadBandai/character_11721_t1.png'; break;
            //case '3106': return '../res/sadBandai/character_11722_t1.png'; break;
            //case '3107': return '../res/sadBandai/character_11727_t1.png'; break;
            //case '3108': return '../res/sadBandai/character_11724_t1.png'; break;
            //case '3109': return '../res/sadBandai/character_11725_t1.png'; break;
            //case '3110': return '../res/sadBandai/character_11728_t1.png'; break;
            case '3111': return '../res/sadBandai/character_11762_t1.png'; break;
            //case '3112': return '../res/sadBandai/character_11800_t1.png'; break;
            //case '3113': return '../res/sadBandai/character_11801_t1.png'; break;
            //case '3114': return '../res/sadBandai/character_11802_t1.png'; break;
            //case '3115': return '../res/sadBandai/character_11803_t1.png'; break;
            //case '3116': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3117': return '../res/sadBandai/character_11804_t1.png'; break;
            //case '3118': return '../res/sadBandai/character_11805_t1.png'; break;
            //case '3119': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3120': return '../res/sadBandai/character_11806_t1.png'; break;
            //case '3121': return '../res/sadBandai/character_11807_t1.png'; break;
            //case '3122': return '../res/sadBandai/character_11334_t1.png'; break;
            //case '3123': return '../res/sadBandai/character_11335_t1.png'; break;
            //case '3124': return '../res/sadBandai/character_11808_t1.png'; break;
            //case '3125': return '../res/sadBandai/character_11726_t1.png'; break;
            //case '3126': return '../res/sadBandai/character_11580_t1.png'; break;
            //case '3127': return '../res/sadBandai/character_11581_t1.png'; break;
            //case '3128': return '../res/sadBandai/character_11569_t1.png'; break;
            //case '3129': return '../res/sadBandai/character_11570_t1.png'; break;
            case '3130': return '../res/sadBandai/character_11911_t1.png'; break;
            //case '3131': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3132': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3133': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3134': return '../res/sadBandai/character_11809_t1.png'; break;
            //case '3135': return '../res/sadBandai/character_11678_t1.png'; break;
            //case '3136': return '../res/sadBandai/character_11679_t1.png'; break;
            //case '3137': return '../res/sadBandai/character_11680_t1.png'; break;
            //case '3138': return '../res/sadBandai/character_11681_t1.png'; break;
            //case '3139': return '../res/sadBandai/character_11682_t1.png'; break;
            //case '3140': return '../res/sadBandai/character_11683_t1.png'; break;
            //case '3141': return '../res/sadBandai/character_11684_t1.png'; break;
            //case '3142': return '../res/sadBandai/character_11811_t1.png'; break;
            //case '3143': return '../res/sadBandai/character_11813_t1.png'; break;
            //case '3144': return '../res/sadBandai/character_11810_t1.png'; break;
            //case '3145': return '../res/sadBandai/character_11518_t1.png'; break;
            //case '3146': return '../res/sadBandai/character_11815_t1.png'; break;
            //case '3147': return '../res/sadBandai/character_11816_t1.png'; break;
            //case '3148': return '../res/sadBandai/character_11817_t1.png'; break;
            //case '3149': return '../res/sadBandai/character_11406_t1.png'; break;
            //case '3150': return '../res/sadBandai/character_11814_t1.png'; break;
            //case '3151': return '../res/sadBandai/character_11217_t1.png'; break;
            //case '3152': return '../res/sadBandai/character_11819_t1.png'; break;
            case '3153': return '../res/sadBandai/character_11818_t1.png'; break;
            //case '3154': return '../res/sadBandai/character_11407_t1.png'; break;
            //case '3155': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3156': return '../res/sadBandai/character_11400_t1.png'; break;
            //case '3157': return '../res/sadBandai/character_11338_t1.png'; break;
            //case '3158': return '../res/sadBandai/character_11812_t1.png'; break;
            //case '3159': return '../res/sadBandai/character_10768_t1.png'; break;
            //case '3160': return '../res/sadBandai/character_10484_t1.png'; break;
            //case '3161': return '../res/sadBandai/character_11112_t1.png'; break;
            //case '3162': return '../res/sadBandai/character_11556_t1.png'; break;
            //case '3163': return '../res/sadBandai/character_11855_t1.png'; break;
            //case '3164': return '../res/sadBandai/character_11856_t1.png'; break;
            //case '3165': return '../res/sadBandai/character_11861_t1.png'; break;
            //case '3166': return '../res/sadBandai/character_11862_t1.png'; break;
            //case '3167': return '../res/sadBandai/character_11863_t1.png'; break;
            //case '3168': return '../res/sadBandai/character_11864_t1.png'; break;
            //case '3169': return '../res/sadBandai/character_11865_t1.png'; break;
            //case '3170': return '../res/sadBandai/character_11866_t1.png'; break;
            //case '3171': return '../res/sadBandai/character_11867_t1.png'; break;
            //case '3172': return '../res/sadBandai/character_11868_t1.png'; break;
            //case '3173': return '../res/sadBandai/character_11821_t1.png'; break;
            //case '3174': return '../res/sadBandai/character_11824_t1.png'; break;
            //case '3175': return '../res/sadBandai/character_11825_t1.png'; break;
            //case '3176': return '../res/sadBandai/character_11826_t1.png'; break;
            //case '3177': return '../res/sadBandai/character_11827_t1.png'; break;
            //case '3178': return '../res/sadBandai/character_11873_t1.png'; break;
            //case '3179': return '../res/sadBandai/character_11874_t1.png'; break;
            //case '3180': return '../res/sadBandai/character_11875_t1.png'; break;
            //case '3181': return '../res/sadBandai/character_11876_t1.png'; break;
            //case '3182': return '../res/sadBandai/character_11877_t1.png'; break;
            //case '3183': return '../res/sadBandai/character_11878_t1.png'; break;
            //case '3184': return '../res/sadBandai/character_11879_t1.png'; break;
            //case '3185': return '../res/sadBandai/character_11880_t1.png'; break;
            //case '3186': return '../res/sadBandai/character_11881_t1.png'; break;
            //case '3187': return '../res/sadBandai/character_11883_t1.png'; break;
            //case '3188': return '../res/sadBandai/character_11882_t1.png'; break;
            //case '3189': return '../res/sadBandai/character_11823_t1.png'; break;
            //case '3190': return '../res/sadBandai/character_11870_t1.png'; break;
            //case '3191': return '../res/sadBandai/character_11871_t1.png'; break;
            //case '3192': return '../res/sadBandai/character_11872_t1.png'; break;
            //case '3193': return '../res/sadBandai/character_11200_t1.png'; break;
            //case '3194': return '../res/sadBandai/character_11201_t1.png'; break;
            //case '3195': return '../res/sadBandai/character_11202_t1.png'; break;
            //case '3196': return '../res/sadBandai/character_11203_t1.png'; break;
            //case '3197': return '../res/sadBandai/character_11869_t1.png'; break;
            //case '3198': return '../res/sadBandai/character_11602_t1.png'; break;
            //case '3199': return '../res/sadBandai/character_11603_t1.png'; break;
            //case '3200': return '../res/sadBandai/character_11450_t1.png'; break;
            //case '3201': return '../res/sadBandai/character_11352_t1.png'; break;
            //case '3202': return '../res/sadBandai/character_11822_t1.png'; break;
            //case '3203': return '../res/sadBandai/character_11908_t1.png'; break;
            //case '3204': return '../res/sadBandai/character_11909_t1.png'; break;
            //case '3205': return '../res/sadBandai/character_11910_t1.png'; break;
            //case '3206': return '../res/sadBandai/character_11820_t1.png'; break;
            //case '3207': return '../res/sadBandai/character_11903_t1.png'; break;
            //case '3208': return '../res/sadBandai/character_11902_t1.png'; break;
            //case '3209': return '../res/sadBandai/character_11901_t1.png'; break;
            //case '3210': return '../res/sadBandai/character_11912_t1.png'; break;
            //case '3211': return '../res/sadBandai/character_11927_t1.png'; break;
            //case '3212': return '../res/sadBandai/character_11913_t1.png'; break;
            //case '3213': return '../res/sadBandai/character_11914_t1.png'; break;
            //case '3214': return '../res/sadBandai/character_11916_t1.png'; break;
            //case '3215': return '../res/sadBandai/character_11917_t1.png'; break;
            //case '3216': return '../res/sadBandai/character_11918_t1.png'; break;
            //case '3217': return '../res/sadBandai/character_11915_t1.png'; break;
            //case '3218': return '../res/sadBandai/character_11919_t1.png'; break;
            //case '3219': return '../res/sadBandai/character_11920_t1.png'; break;
            //case '3220': return '../res/sadBandai/character_11921_t1.png'; break;
            //case '3221': return '../res/sadBandai/character_11922_t1.png'; break;
            //case '3222': return '../res/sadBandai/character_11951_t1.png'; break;
            //case '3223': return '../res/sadBandai/character_11952_t1.png'; break;
            //case '3224': return '../res/sadBandai/character_11923_t1.png'; break;
            //case '3225': return '../res/sadBandai/character_11924_t1.png'; break;
            //case '3226': return '../res/sadBandai/character_11926_t1.png'; break;
            //case '3227': return '../res/sadBandai/character_11174_t1.png'; break;
            //case '3228': return '../res/sadBandai/character_11517_t1.png'; break;
            //case '3229': return '../res/sadBandai/character_11954_t1.png'; break;
            //case '3230': return '../res/sadBandai/character_11955_t1.png'; break;
            //case '3231': return '../res/sadBandai/character_11956_t1.png'; break;
            //case '3232': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3233': return '../res/sadBandai/character_11617_t1.png'; break;
            //case '3234': return '../res/sadBandai/character_12077_t1.png'; break;
            //case '3235': return '../res/sadBandai/character_11953_t1.png'; break;
            //case '3236': return '../res/sadBandai/character_11186_t1.png'; break;
            //case '3237': return '../res/sadBandai/character_11958_t1.png'; break;
            //case '3238': return '../res/sadBandai/character_11959_t1.png'; break;
            //case '3239': return '../res/sadBandai/character_11960_t1.png'; break;
            //case '3240': return '../res/sadBandai/character_11957_t1.png'; break;
            //case '3241': return '../res/sadBandai/character_11961_t1.png'; break;
            //case '3242': return '../res/sadBandai/character_11962_t1.png'; break;
            //case '3243': return '../res/sadBandai/character_11623_t1.png'; break;
            //case '3244': return '../res/sadBandai/character_11078_t1.png'; break;
            //case '3245': return '../res/sadBandai/character_11079_t1.png'; break;
            //case '3246': return '../res/sadBandai/character_11963_t1.png'; break;
            //case '3247': return '../res/sadBandai/character_11964_t1.png'; break;
            //case '3248': return '../res/sadBandai/character_11965_t1.png'; break;
            //case '3249': return '../res/sadBandai/character_11966_t1.png'; break;
            //case '3250': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3251': return '../res/sadBandai/character_11369_t1.png'; break;
            //case '3252': return '../res/sadBandai/character_11971_t1.png'; break;
            //case '3253': return '../res/sadBandai/character_11972_t1.png'; break;
            //case '3254': return '../res/sadBandai/character_12001_t1.png'; break;
            //case '3255': return '../res/sadBandai/character_11225_t1.png'; break;
            //case '3256': return '../res/sadBandai/character_11973_t1.png'; break;
            //case '3257': return '../res/sadBandai/character_11974_t1.png'; break;
            //case '3258': return '../res/sadBandai/character_11975_t1.png'; break;
            //case '3259': return '../res/sadBandai/character_11976_t1.png'; break;
            //case '3260': return '../res/sadBandai/character_11977_t1.png'; break;
            //case '3261': return '../res/sadBandai/character_11978_t1.png'; break;
            //case '3262': return '../res/sadBandai/character_11979_t1.png'; break;
            //case '3263': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3264': return '../res/sadBandai/character_12131_t1.png'; break;
            //case '3265': return '../res/sadBandai/character_11355_t1.png'; break;
            //case '3266': return '../res/sadBandai/character_11357_t1.png'; break;
            //case '3267': return '../res/sadBandai/character_11358_t1.png'; break;
            //case '3268': return '../res/sadBandai/character_11359_t1.png'; break;
            //case '3269': return '../res/sadBandai/character_11925_t1.png'; break;
            //case '3270': return '../res/sadBandai/character_12002_t1.png'; break;
            //case '3271': return '../res/sadBandai/character_12003_t1.png'; break;
            //case '3272': return '../res/sadBandai/character_12004_t1.png'; break;
            //case '3273': return '../res/sadBandai/character_11980_t1.png'; break;
            //case '3276': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3277': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3278': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3279': return '../res/sadBandai/character_11_t1.png'; break;
            case '3333': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5013.png'; break;
            case '3334': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5014.png'; break;
            //case '2399': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5015.png'; break;
            //case '2784': return '../res/character_10642_t1.png'; break;
            case '3312': return '../res/character_10852_t1.png'; break;
            case '3313': return '../res/character_10853_t1.png'; break;
            //case '2663': return '../res/character_10713_t1.png'; break;
            //case '2664': return '../res/character_10714_t1.png'; break;
            //case '2685': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5025.png'; break;
            //case '2686': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5026.png'; break;
            case '3347': return '../res/character_1508_t1.png'; break;
            case '3348': return '../res/character_1509_t1.png'; break;
            case '3349': return '../res/character_1510_t1.png'; break;
            case '3350': return '../res/character_1511_t1.png'; break;
            case '3314': return '../res/character_10861_t1.png'; break;
            case '3315': return '../res/character_10862_t1.png'; break;
            case '3316': return '../res/character_10994_t1.png'; break;
            case '3317': return '../res/character_10995_t1.png'; break;
            //case '2772': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5037.png'; break;
            case '3321': return '../res/character_10869_t1.png'; break;
            case '3322': return '../res/character_10870_t1.png'; break;
            case '3323': return '../res/character_10867_t1.png'; break;
            case '3324': return '../res/character_10868_t1.png'; break;
            case '3360': return '../res/character_11037_t1.png'; break;
            case '3361': return '../res/character_11038_t1.png'; break;
            case '2768': return '../res/character_10258_t1.png'; break;
            case '2769': return '../res/character_10259_t1.png'; break;
            case '2770': return '../res/character_10262_t1.png'; break;
            case '2771': return '../res/character_10263_t1.png'; break;
            case '3318': return '../res/character_10858_t1.png'; break;
            case '3319': return '../res/character_10859_t1.png'; break;
            case '3320': return '../res/character_10860_t1.png'; break;
            //case '2919': return '../res/character_10891_t1.png'; break;
            case '3370': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5052.png'; break;
            case '3371': return '../res/character_11243_t.png'; break;
            case '3372': return '../res/character_11244_t.png'; break;
            case '3373': return '../res/character_11245_t.png'; break;
            case '3374': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5053.png'; break;
            case '3325': return '../res/character_10863_t.png'; break;
            case '3326': return '../res/character_10864_t.png'; break;
            //case '2929': return '../res/character_11221_t1.png'; break;
            //case '2930': return '../res/character_11199_t1.png'; break;
            case '3327': return '../res/character_11333_t1.png'; break;
            //case '3327': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5059.png'; break;
            case '3381': return '../res/KDugejE.png'; break;
            case '3382': return '../res/character_11615_t1.png'; break;
            case '3383': return '../res/character_11760_t.png'; break;
            case '3384': return '../res/character_11400_t1.png'; break;
            case '3385': return '../res/character_11338_t1.png'; break;
            //case '2909': return '../res/character_11173_t1.png'; break;
            //case '3370': return '../res/character_10891_t1.png'; break;
            //case '2440': return '../res/character_10643_t1.png'; break;
            //case '2441': return '../res/character_10644_t1.png'; break;
            case '5000': return '../res/character_10185_t1.png'; break;
            case '5001': return '../res/character_10186_t1.png'; break;
            case '5002': return '../res/character_10187_t1_int.png'; break;
            case '5003': return '../res/character_10187_t1_psy.png'; break;
            case '5004': return '../res/character_10173_t1.png'; break;
            case '5005': return '../res/character_10174_t1.png'; break;
            case '5006': return '../res/character_10177_t1_qck.png'; break;
            case '5007': return '../res/character_10177_t1_str.png'; break;
            case '5008': return '../res/character_10175_t1.png'; break;
            case '5009': return '../res/character_10176_t1.png'; break;
            case '5010': return '../res/character_10178_t1_qck.png'; break;
            case '5011': return '../res/character_10178_t1_str.png'; break;
            case '5012': return '../res/character_10181_t1.png'; break;
            case '5013': return '../res/character_10182_t1.png'; break;
            case '5014': return '../res/character_10183_t1_psy.png'; break;
            case '5015': return '../res/character_10183_t1_dex.png'; break;
            case '5016': return '../res/character_10344_t1.png'; break;
            case '5017': return '../res/character_10345_t1.png'; break;
            case '5018': return '../res/character_10348_t1_psy.png'; break;
            case '5019': return '../res/character_10348_t1_int.png'; break;
            case '5020': return '../res/character_10346_t1.png'; break;
            case '5021': return '../res/character_10347_t1.png'; break;
            case '5022': return '../res/character_10349_t1_psy.png'; break;
            case '5023': return '../res/character_10349_t1_int.png'; break;
            case '5024': return '../res/character_10496_t1.png'; break;
            case '5025': return '../res/character_10497_t1.png'; break;
            case '5026': return '../res/character_10498_t1_dex.png'; break;
            case '5027': return '../res/character_10498_t1_str.png'; break;
            case '5028': return '../res/character_10636_t1.png'; break;
            case '5029': return '../res/character_10637_t1.png'; break;
            case '5030': return '../res/character_10640_t1_int.png'; break;
            case '5031': return '../res/character_10640_t1_dex.png'; break;
            case '5032': return '../res/character_10638_t1.png'; break;
            case '5033': return '../res/character_10639_t1.png'; break;
            case '5034': return '../res/character_10641_t1_int.png'; break;
            case '5035': return '../res/character_10641_t1_dex.png'; break;
            case '5036': return '../res/character_10649_t1.png'; break;
            case '5037': return '../res/character_10650_t1.png'; break;
            case '5038': return '../res/character_10653_t1_dex.png'; break;
            case '5039': return '../res/character_10653_t1_qck.png'; break;
            case '5040': return '../res/character_10651_t1.png'; break;
            case '5041': return '../res/character_10652_t1.png'; break;
            case '5042': return '../res/character_10654_t1_dex.png'; break;
            case '5043': return '../res/character_10654_t1_qck.png'; break;
            //case '2818': return '../res/character_10707_t1.png'; break;
            //case '2819': return '../res/character_10708_t1.png'; break;
            case '5044': return '../res/character_10703_t.png'; break;
            case '5045': return '../res/character_10704_t.png'; break;
            case '5046': return '../res/character_10707_t1_qck.png'; break;
            case '5047': return '../res/character_10707_t1_int.png'; break;
            case '5048': return '../res/character_10705_t.png'; break;
            case '5049': return '../res/character_10706_t.png'; break;
            case '5050': return '../res/character_10708_t1_qck.png'; break;
            case '5051': return '../res/character_10708_t1_int.png'; break;
            case '5052': return '../res/character_10720_t1.png'; break;
            case '5053': return '../res/character_10721_t1.png'; break;
            case '5054': return '../res/character_10724_t1_psy.png'; break;
            case '5055': return '../res/character_10722_t1.png'; break;
            case '5056': return '../res/character_10723_t1.png'; break;
            case '5057': return '../res/character_10725_t1_psy.png'; break;
            case '5058': return '../res/character_10735_t1.png'; break;
            case '5059': return '../res/character_10736_t1.png'; break;
            case '5060': return '../res/character_10739_t1_psy.png'; break;
            case '5061': return '../res/character_10739_t1_qck.png'; break;
            case '5062': return '../res/character_10737_t1.png'; break;
            case '5063': return '../res/character_10738_t1.png'; break;
            case '5064': return '../res/character_10740_t1_psy.png'; break;
            case '5065': return '../res/character_10740_t1_qck.png'; break;
            case '5066': return '../res/character_10832_t1.png'; break;
            case '5067': return '../res/character_10833_t1.png'; break;
            case '5068': return '../res/character_10836_t1_int.png'; break;
            case '5069': return '../res/character_10836_t1_qck.png'; break;
            case '5070': return '../res/character_10834_t1.png'; break;
            case '5071': return '../res/character_10835_t1.png'; break;
            case '5072': return '../res/character_10837_t1_int.png'; break;
            case '5073': return '../res/character_10837_t1_qck.png'; break;
            case '5074': return '../res/character_10950_t1.png'; break;
            case '5075': return '../res/character_10951_t1.png'; break;
            case '5076': return '../res/character_10952_t1_dex.png'; break;
            case '5077': return '../res/character_10952_t1_qck.png'; break;
            case '5078': return '../res/character_10773_t1.png'; break;
            case '5079': return '../res/character_10774_t1.png'; break;
            case '5080': return '../res/character_10775_t1_int.png'; break;
            case '5081': return '../res/character_10775_t1_qck.png'; break;
            case '5082': return '../res/character_10784_t1.png'; break;
            case '5083': return '../res/character_10785_t1.png'; break;
            case '5084': return '../res/character_10788_t1_dex.png'; break;
            case '5085': return '../res/character_10788_t1_qck.png'; break;
            case '5086': return '../res/character_10786_t1.png'; break;
            case '5087': return '../res/character_10787_t1.png'; break;
            case '5088': return '../res/character_10789_t1_dex.png'; break;
            case '5089': return '../res/character_10789_t1_qck.png'; break;
            case '5090': return '../res/character_10816_t1.png'; break;
            case '5091': return '../res/character_10817_t1.png'; break;
            case '5092': return '../res/character_10820_t1_int.png'; break;
            case '5093': return '../res/character_10818_t1.png'; break;
            case '5094': return '../res/character_10819_t1.png'; break;
            case '5095': return '../res/character_10821_t1_int.png'; break;
            case '5096': return '../res/character_10871_t1.png'; break;
            case '5097': return '../res/character_10872_t1.png'; break;
            case '5098': return '../res/character_10875_t1_str.png'; break;
            case '5099': return '../res/character_10875_t1_dex.png'; break;
            case '5100': return '../res/character_10873_t1.png'; break;
            case '5101': return '../res/character_10874_t1.png'; break;
            case '5102': return '../res/character_10876_t1_str.png'; break;
            case '5103': return '../res/character_10876_t1_dex.png'; break;
            case '5104': return '../res/character_10877_t1.png'; break;
            case '5105': return '../res/character_10878_t1.png'; break;
            case '5106': return '../res/character_10881_t1_psy.png'; break;
            case '5107': return '../res/character_10881_t1_str.png'; break;
            case '5108': return '../res/character_10879_t1.png'; break;
            case '5109': return '../res/character_10880_t1.png'; break;
            case '5110': return '../res/character_10882_t1_psy.png'; break;
            case '5111': return '../res/character_10882_t1_str.png'; break;
            case '5112': return '../res/character_10883_t1.png'; break;
            case '5113': return '../res/character_10884_t1.png'; break;
            case '5114': return '../res/character_10887_t1_qck.png'; break;
            case '5115': return '../res/character_10887_t1_psy.png'; break;
            case '5116': return '../res/character_10885_t1.png'; break;
            case '5117': return '../res/character_10886_t1.png'; break;
            case '5118': return '../res/character_10888_t1_qck.png'; break;
            case '5119': return '../res/character_10888_t1_psy.png'; break;
            case '5120': return '../res/character_10826_t1.png'; break;
            case '5121': return '../res/character_10827_t1.png'; break;
            case '5122': return '../res/character_10830_t1_dex.png'; break;
            case '5123': return '../res/character_10830_t1_int.png'; break;
            case '5124': return '../res/character_10828_t1.png'; break;
            case '5125': return '../res/character_10829_t1.png'; break;
            case '5126': return '../res/character_10831_t1_dex.png'; break;
            case '5127': return '../res/character_10831_t1_int.png'; break;
            case '5128': return '../res/character_10778_t1.png'; break;
            case '5129': return '../res/character_10779_t1.png'; break;
            case '5130': return '../res/character_10782_t1_str.png'; break;
            case '5131': return '../res/character_10782_t1_dex.png'; break;
            case '5132': return '../res/character_10780_t1.png'; break;
            case '5133': return '../res/character_10781_t1.png'; break;
            case '5134': return '../res/character_10783_t1_str.png'; break;
            case '5135': return '../res/character_10783_t1_dex.png'; break;
            case '5136': return '../res/character_10895_t1.png'; break;
            case '5137': return '../res/character_10896_t1.png'; break;
            case '5138': return '../res/character_10899_t1_int.png'; break;
            case '5139': return '../res/character_10899_t1_dex.png'; break;
            case '5140': return '../res/character_10897_t1.png'; break;
            case '5141': return '../res/character_10898_t1.png'; break;
            case '5142': return '../res/character_10900_t1_int.png'; break;
            case '5143': return '../res/character_10900_t1_dex.png'; break;
            case '5144': return '../res/character_10910_t1.png'; break;
            case '5145': return '../res/character_10911_t1.png'; break;
            case '5146': return '../res/character_10914_t1_str.png'; break;
            case '5147': return '../res/character_10914_t1_int.png'; break;
            case '5148': return '../res/character_10912_t1.png'; break;
            case '5149': return '../res/character_10913_t1.png'; break;
            case '5150': return '../res/character_10915_t1_str.png'; break;
            case '5151': return '../res/character_10915_t1_int.png'; break;
            case '5152': return '../res/character_10916_t1.png'; break;
            case '5153': return '../res/character_10917_t1.png'; break;
            case '5154': return '../res/character_10920_t1_str.png'; break;
            case '5155': return '../res/character_10920_t1_psy.png'; break;
            case '5156': return '../res/character_10918_t1.png'; break;
            case '5157': return '../res/character_10919_t1.png'; break;
            case '5158': return '../res/character_10921_t1_str.png'; break;
            case '5159': return '../res/character_10921_t1_psy.png'; break;
            case '5160': return '../res/character_10954_t1.png'; break;
            case '5161': return '../res/character_10955_t1.png'; break;
            case '5162': return '../res/character_10958_t1_dex.png'; break;
            case '5163': return '../res/character_10958_t1_str.png'; break;
            case '5164': return '../res/character_10956_t1.png'; break;
            case '5165': return '../res/character_10957_t1.png'; break;
            case '5166': return '../res/character_10959_t1_dex.png'; break;
            case '5167': return '../res/character_10959_t1_str.png'; break;
            case '5168': return '../res/character_10960_t1.png'; break;
            case '5169': return '../res/character_10961_t1.png'; break;
            case '5170': return '../res/character_10964_t1_int.png'; break;
            case '5171': return '../res/character_10964_t1_psy.png'; break;
            case '5172': return '../res/character_10962_t1.png'; break;
            case '5173': return '../res/character_10963_t1.png'; break;
            case '5174': return '../res/character_10965_t1_int.png'; break;
            case '5175': return '../res/character_10965_t1_psy.png'; break;
            case '5176': return '../res/character_10803_t1.png'; break;
            case '5177': return '../res/character_10804_t1.png'; break;
            case '5178': return '../res/character_10805_t1_str.png'; break;
            case '5179': return '../res/character_10805_t1_int.png'; break;
            case '5180': return '../res/character_10889_t1.png'; break;
            case '5181': return '../res/character_10890_t1.png'; break;
            case '5182': return '../res/character_10891_t1_dex.png'; break;
            case '5183': return '../res/character_10891_t1_qck.png'; break;
            case '5184': return '../res/character_11099_t1.png'; break;
            case '5185': return '../res/character_11100_t1.png'; break;
            case '5186': return '../res/character_11102_t1_qck.png'; break;
            case '5187': return '../res/character_11166_t1.png'; break;
            case '5188': return '../res/character_11167_t1.png'; break;
            case '5189': return '../res/character_11168_t1_psy.png'; break;
            case '5190': return '../res/character_11168_t1_int.png'; break;
            case '5191': return '../res/character_11187_t1.png'; break;
            case '5192': return '../res/character_11188_t1.png'; break;
            case '5193': return '../res/character_11191_t1_str.png'; break;
            case '5194': return '../res/character_11191_t1_dex.png'; break;
            case '5195': return '../res/character_11189_t1.png'; break;
            case '5196': return '../res/character_11190_t1.png'; break;
            case '5197': return '../res/character_11192_t1_str.png'; break;
            case '5198': return '../res/character_11192_t1_dex.png'; break;
            case '5199': return '../res/character_11129_t1.png'; break;
            case '5200': return '../res/character_11130_t1.png'; break;
            case '5201': return '../res/character_11131_t1_str.png'; break;
            case '5202': return '../res/character_11227_t1.png'; break;
            case '5203': return '../res/character_11228_t1.png'; break;
            case '5204': return '../res/character_11231_t1_dex.png'; break;
            case '5205': return '../res/character_11231_t1_int.png'; break;
            case '5206': return '../res/character_11229_t1.png'; break;
            case '5207': return '../res/character_11230_t1.png'; break;
            case '5208': return '../res/character_11232_t1_dex.png'; break;
            case '5209': return '../res/character_11232_t1_int.png'; break;
            case '5210': return '../res/character_11260_t1.png'; break;
            case '5211': return '../res/character_11261_t1.png'; break;
            case '5212': return '../res/character_11262_t1_dex.png'; break;
            case '5213': return '../res/character_11262_t1_int.png'; break;
            case '5214': return '../res/character_11254_t1.png'; break;
            case '5215': return '../res/character_11255_t1.png'; break;
            case '5216': return '../res/character_11258_t1_str.png'; break;
            case '5217': return '../res/character_11256_t1.png'; break;
            case '5218': return '../res/character_11257_t1.png'; break;
            case '5219': return '../res/character_11259_t1_str.png'; break;
            case '5220': return '../res/character_11306_t1.png'; break;
            case '5221': return '../res/character_11307_t1.png'; break;
            case '5222': return '../res/character_11310_t1_psy.png'; break;
            case '5223': return '../res/character_11310_t1_qck.png'; break;
            case '5224': return '../res/character_11308_t1.png'; break;
            case '5225': return '../res/character_11309_t1.png'; break;
            case '5226': return '../res/character_11311_t1_psy.png'; break;
            case '5227': return '../res/character_11311_t1_qck.png'; break;
            case '5228': return '../res/character_11318_t1.png'; break;
            case '5229': return '../res/character_11319_t1.png'; break;
            case '5230': return '../res/character_11322_t1_str.png'; break;
            case '5231': return '../res/character_11322_t1_qck.png'; break;
            case '5232': return '../res/character_11320_t1.png'; break;
            case '5233': return '../res/character_11321_t1.png'; break;
            case '5234': return '../res/character_11323_t1_str.png'; break;
            case '5235': return '../res/character_11323_t1_qck.png'; break;
            case '5236': return '../res/character_11324_t1.png'; break;
            case '5237': return '../res/character_11325_t1.png'; break;
            case '5238': return '../res/character_11328_t1_qck.png'; break;
            case '5239': return '../res/character_11328_t1_dex.png'; break;
            case '5240': return '../res/character_11326_t1.png'; break;
            case '5241': return '../res/character_11327_t1.png'; break;
            case '5242': return '../res/character_11329_t1_qck.png'; break;
            case '5243': return '../res/character_11329_t1_dex.png'; break;
            case '5244': return '../res/character_11314_t1.png'; break;
            case '5245': return '../res/character_11315_t1.png'; break;
            case '5246': return '../res/character_11317_t1_int.png'; break;
            case '5247': return '../res/character_11371_t1.png'; break;
            case '5248': return '../res/character_11372_t1.png'; break;
            case '5249': return '../res/character_11375_t1_str.png'; break;
            case '5250': return '../res/character_11375_t1_psy.png'; break;
            case '5251': return '../res/character_11373_t1.png'; break;
            case '5252': return '../res/character_11374_t1.png'; break;
            case '5253': return '../res/character_11376_t1_str.png'; break;
            case '5254': return '../res/character_11376_t1_psy.png'; break;
            case '5255': return '../res/smuAu7N.png'; break;
            case '5256': return '../res/ZPSk7PQ.png'; break;
            case '5257': return '../res/KDugejE_qck.png'; break;
            case '5258': return '../res/KDugejE_int.png'; break;
            case '5259': return '../res/character_11532_t1.png'; break;
            case '5260': return '../res/character_11533_t1.png'; break;
            case '5261': return '../res/character_11534_t1_psy.png'; break;
            case '5262': return '../res/character_11534_t1_int.png'; break;
            case '5263': return '../res/character_11661_t1.png'; break;
            case '5264': return '../res/character_11660_t1.png'; break;
            case '5265': return '../res/character_11662_t1_dex.png'; break;
            case '5266': return '../res/character_11662_t1_psy.png'; break;
            case '5267': return '../res/character_11582_t1.png'; break;
            case '5268': return '../res/character_11583_t1.png'; break;
            case '5269': return '../res/character_11586_t1_str.png'; break;
            case '5270': return '../res/character_11586_t1_psy.png'; break;
            case '5271': return '../res/character_11584_t1.png'; break;
            case '5272': return '../res/character_11585_t1.png'; break;
            case '5273': return '../res/character_11587_t1_str.png'; break;
            case '5274': return '../res/character_11587_t1_psy.png'; break;
            case '5275': return '../res/character_11712_t1.png'; break;
            case '5276': return '../res/character_11713_t1.png'; break;
            case '5277': return '../res/character_11714_t1_str.png'; break;
            case '5278': return '../res/character_11714_t1_psy.png'; break;
            case '5279': return '../res/character_11673_t1.png'; break;
            case '5280': return '../res/character_11674_t1.png'; break;
            case '5281': return '../res/character_11675_t1.png'; break;
            case '5282': return '../res/character_11676_t1.png'; break;
            case '5283': return '../res/character_11851_t1.png'; break;
            case '5284': return '../res/character_11852_t1.png'; break;
            case '5285': return '../res/character_11855_t1_qck.png'; break;
            case '5286': return '../res/character_11855_t1_dex.png'; break;
            case '5287': return '../res/character_11853_t1.png'; break;
            case '5288': return '../res/character_11854_t1.png'; break;
            case '5289': return '../res/character_11856_t1_qck.png'; break;
            case '5290': return '../res/character_11856_t1_dex.png'; break;
            case '5291': return '../res/character_11857_t1.png'; break;
            case '5292': return '../res/character_11858_t1.png'; break;
            case '5293': return '../res/character_11861_t1_qck.png'; break;
            case '5294': return '../res/character_11861_t1_psy.png'; break;
            case '5295': return '../res/character_11859_t1.png'; break;
            case '5296': return '../res/character_11860_t1.png'; break;
            case '5297': return '../res/character_11862_t1_qck.png'; break;
            case '5298': return '../res/character_11862_t1_psy.png'; break;
            case '5299': return '../res/character_11904_t1.png'; break;
            case '5300': return '../res/character_11905_t1.png'; break;
            case '5301': return '../res/character_11908_t1_qck.png'; break;
            case '5302': return '../res/character_11908_t1_dex.png'; break;
            case '5303': return '../res/character_11906_t1.png'; break;
            case '5304': return '../res/character_11907_t1.png'; break;
            case '5305': return '../res/character_11909_t1_qck.png'; break;
            case '5306': return '../res/character_11909_t1_dex.png'; break;
            case '5307': return '../res/character_11967_t1.png'; break;
            case '5308': return '../res/character_11968_t1.png'; break;
            case '5309': return '../res/character_11969_t1.png'; break;
            case '5310': return '../res/character_11970_t1.png'; break;
            case '5311': return '../res/character_12009_t1.png'; break;
            case '5312': return '../res/character_12010_t1.png'; break;
            case '5313': return '../res/character_12013_t1_int.png'; break;
            case '5314': return '../res/character_12011_t1.png'; break;
            case '5315': return '../res/character_12012_t1.png'; break;
            case '5316': return '../res/character_12014_t1_int.png'; break;
            default: break;
        }
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/f' + id + '.png';
    };

    utils.getBigThumbnailUrl = function (n) {
        switch (n){
            case 'skullLuffy':
            case 9001: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_luffy_c.png'; break;
            case 'skullZoro':
            case 9002: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_zoro_c.png'; break;
            case 'skullNami':
            case 9003: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_nami_c.png'; break;
            case 'skullUsopp':
            case 9004: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_usopp_c.png'; break;
            case 'skullSanji':
            case 9005: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_sanji_c.png'; break;
            case 'skullChopper':
            case 9006: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_chopper_c.png'; break;
            case 'skullRobin':
            case 9007: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_robin_c.png'; break;
            case 'skullFranky':
            case 9008: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_franky_c.png'; break;
            case 'skullBrook':
            case 9009: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_brook_c.png'; break;
            case 'skullSTR':
            case 9010: return 'https://onepiece-treasurecruise.com/wp-content/uploads/red_skull_c.png'; break;
            case 'skullQCK':
            case 9011: return 'https://onepiece-treasurecruise.com/wp-content/uploads/blue_skull_c.png'; break;
            case 'skullPSY':
            case 9012: return 'https://onepiece-treasurecruise.com/wp-content/uploads/yellow_skull2_c.png'; break;
            case 'skullDEX':
            case 9013: return 'https://onepiece-treasurecruise.com/wp-content/uploads/green_skull2_c.png'; break;
            case 'skullINT':
            case 9014: return 'https://onepiece-treasurecruise.com/wp-content/uploads/black_skull_c.png'; break;
            case 'skullJudge':
            case 9015: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c1.png'; break;
            case 'skullReiju':
            case 9016: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c2.png'; break;
            case 'skullIchiji':
            case 9017: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c3.png'; break;
            case 'skullNiji':
            case 9018: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c4.png'; break;
            case 'skullYonji':
            case 9019: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c5.png'; break;
            case 'skullDoffy':
            case 9020: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c.png'; break;
            case 'skullEnel':
            case 9021: return 'https://onepiece-treasurecruise.com/wp-content/uploads/enel_skull_c.png'; break;
            case 'skullHiguma':
            case 9022: return 'https://onepiece-treasurecruise.com/wp-content/uploads/higuma_skull_c.png'; break;
            case 'skullSanji2':
            case 9023: return 'https://onepiece-treasurecruise.com/wp-content/uploads/sanji_skull_f.png'; break;
            case 'skullFrankie':
            case 9024: return 'https://onepiece-treasurecruise.com/wp-content/uploads/frankie_skull_c.png'; break;
            case 'skullCavendish':
            case 9025: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Cavendish_skull_c.png'; break;
            case 'skullDoflamingo':
            case 9026: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c2.png'; break;
            case 'skullIchiji2':
            case 9027: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c6.png'; break;
            case 'skullNiji2':
            case 9028: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c7.png'; break;
            case 'skullYonji2':
            case 9029: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c8.png'; break;
            case 'skullReiju2':
            case 9030: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c9.png'; break;
            case 'skullHancock':
            case 9031: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Hancock_skull_c.png'; break;
            case 'skullNami2':
            case 9032: return 'https://onepiece-treasurecruise.com/wp-content/uploads/nami_skull_c.png'; break;
            case 'skullBullet':
            case 9033: return '../res/skullBullet.png'; break;
            case 'skullKatakuri':
            case 9034: return '../res/skullKatakuri.png'; break;
            case 'skullWhitebeard':
            case 9035: return '../res/skullWhitebeard.png'; break;
            //case 'skullCP9':
            //case 9036: return '../res/skullCP9.png'; break;
        }
        if (window.units[n - 1].incomplete)
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1'); // missing aokiji image
        switch(id){
            //case '2262': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5012.png'; break;
            //case '2263': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5013.png'; break;
            //case '2500': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c2500.png'; break;
            case '3333': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1719.png'; break;
            case '3334': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1720.png'; break;
            //case '2685': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10686.png'; break;
            //case '2686': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10687.png'; break;
            //case '2772': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_10993.png'; break;
            case '3370': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11102-1.png'; break;
            case '3374': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11138.png'; break;
            case '3327': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11333-.png'; break;
            default: break;
        }
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/c' + id + '.png';
    };

    utils.getThumbnailTitle = function (arg) {
        if (arg === null || arg === undefined)
            return null;
        if (arg.constructor == Object) {
            return [arg.name, 'HP: ' + arg.hp, 'ATK: ' + arg.atk, 'RCV: ' + arg.rcv, 'CMB: ' + arg.cmb].join('\n');
        }
        var unit = (arg.constructor == Object ? arg : units[arg]);
        return [unit.name, 'HP: ' + unit.maxHP, 'ATK: ' + unit.maxATK, 'RCV: ' + unit.maxRCV, 'CMB: ' + unit.combo, 'Cost: ' + unit.cost].join('\n');
    };

    utils.isClickOnOrb = function (e, target) {
        var x = e.offsetX, y = e.offsetY;
        var distance = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(y - 21, 2));
        return distance < 13;
    };

    /* * * * * Misc functions * * * * */

    /* given an array of arrays, generates the cartesian product of
     * all the arrays contained within the root array
     * eg f([[1],[2,3],[4,5,6]]) -> [[1,2,4],[1,2,5],[1,2,6],[1,3,4],[1,3,5],[1,3,6]] */
    utils.arrayProduct = function (data) {
        var result = data.reduce(function (prev, next) {
            if (next.length === 0)
                return prev;
            return next.map(function (n) {
                return prev.map(function (p) {
                    return p.concat([n]);
                });
            }).reduce(function (prev, next) {
                return prev.concat(next);
            }, []);
        }, [[]]);
        return result.filter(function (r) {
            return r.length > 0;
        });
    };

    utils.getOppositeType = function (type) {
        if (!type)
            return null;
        type = type.toUpperCase();
        if (type == 'STR')
            return 'QCK';
        if (type == 'QCK')
            return 'DEX';
        if (type == 'DEX')
            return 'STR';
        if (type == 'PSY')
            return 'INT';
        return 'PSY';
    };

    /* * * * * Searching/filtering * * * * */

    utils.getRegex = function (query) {
        try {
            return new RegExp(query, 'i');
        } catch (e) {
            return new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'i');
        }
    };

    utils.generateSearchParameters = function (query) {
        if (!query || query.trim().length < 2)
            return null;
        query = query.toLowerCase().trim();
        var result = {matchers: {}, ranges: {}, query: []};
        var ranges = {}, params = ['hp', 'atk', 'stars', 'cost', 'growth', 'rcv', 'id', 'slots', 'combo', 'exp', 'minCD', 'maxCD'];
        var regex = new RegExp('^((type|class|support):(\\w+\\s{0,1}\\w+)|(' + params.join('|') + ')(>|<|>=|<=|=)([-?\\d.]+))$', 'i');
        var tokens = query.replace(/\s+/g, ' ').split(' ').filter(function (x) {
            return x.length > 0;
        });
        tokens.forEach(function (x) {
            x = x.replace("_", ' ');
            var temp = x.match(regex);
            if (!temp) // if it couldn't be parsed, treat it as string
                result.query.push(x);
            else if (temp[4] !== undefined) { // numeric operator
                var parameter = temp[4],
                        op = temp[5],
                        value = parseFloat(temp[6], 10);
                if (parameter === 'exp')
                    parameter = 'maxEXP';
                if (!result.ranges.hasOwnProperty(parameter)) {
                    if (op === '>' || op === '>=') {
                        result.ranges[parameter] = [0, Number.POSITIVE_INFINITY];
                    } else if (op === '<' || op === '<=') {
                        result.ranges[parameter] = [Number.NEGATIVE_INFINITY, 0];
                    }else{
                         result.ranges[parameter] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
                    }
                }
                if (op === '=') {
                    result.ranges[parameter][0] = value;
                    result.ranges[parameter][1] = value;
                } else if (op === '<') {
                    result.ranges[parameter][1] =  value - 1;
                } else if (op === '<=') {
                    result.ranges[parameter][1] = value;
                } else if (op === '>') {
                    result.ranges[parameter][0] =  value + 1;
                } else if (op === '>=') {
                    result.ranges[parameter][0] =  value;
                }
            } else // matcher
                result.matchers[temp[2]] = new RegExp(temp[3], 'i');
                //console.log(result.matchers); Here for stuff to try to do custom
        });
        if (result.query.length > 0)
            result.query = utils.getRegex(result.query.join(' '));
        else
            result.query = null;
        return result;
    };

    utils.isFodder = function (unit) {
        return (unit.stars < 2 && !utils.isEvolverBooster(unit)) || FODDER_REGEX.test(unit.name);
    };

    utils.isEvolverBooster = function (unit) {
        return /Evolver|Booster/i.test(unit.class);
    };

    utils.searchBaseForms = function (id) {
        if (!reverseEvoMap)
            generateReverseEvoMap();
        if (!reverseEvoMap[id])
            return null;
        return reverseEvoMap[id];
    };

    var updateEvoMap = function (from, to, via) {
        if (!reverseEvoMap[to])
            reverseEvoMap[to] = {};
        if (!reverseEvoMap[to][from])
            reverseEvoMap[to][from] = [];
        reverseEvoMap[to][from].push(via);
    };

    var generateReverseEvoMap = function () {
        reverseEvoMap = {};
        for (var evo in evolutions) {
            var from = parseInt(evo, 10);
            if (evolutions[evo].evolution.constructor != Array)
                updateEvoMap(from, evolutions[evo].evolution, evolutions[evo].evolvers);
            else
                for (var i = 0; i < evolutions[evo].evolution.length; ++i)
                    updateEvoMap(from, evolutions[evo].evolution[i], evolutions[evo].evolvers[i]);
        }
    };

    /* * * * * Body * * * * */

    window.Utils = utils;

})();
