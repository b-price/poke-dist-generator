export const title = "Trainer Pokémon Distribution Generator";
export const pokemonText = "Pokémon";
export const maxPreGym = 0.87;
export const minPostGym = 0.65;
export const bstMinFactor = 0.8;
export const bstMaxFactor = 1.2;
export const legends = [
    144, 145, 146, 150, 151,
    243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720, 721,
    785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 808, 809,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
    1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
];
export const beasts = [794, 795, 796, 797, 798, 799, 803, 804, 805, 806, 807];
export const paradox = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023];
export const gens = [0, 151, 251, 386, 493, 649, 721, 905, 1025];
export const expGrowthFunction = (level: number) => {
    return Math.pow(level, 3);
}