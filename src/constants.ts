import {GrowthRates} from "./types.ts";

export const title = "Trainer Pokémon Distribution Generator";
export const pokemonText = "Pokémon";

// the proportion of the level of gym leader's ace that regular trainers can have
export const maxPreGym = 0.9;

// the proportion of the level of the previous gym leader's ace that is the minimum level trainers can have
export const minPostGym = 0.65;

// introduces more variance in the BST range for each split
export const bstMinFactor = 0.8;

// introduces more variance in the BST range for each split
export const bstMaxFactor = 1.2;

// dex numbers of legendary pokemon (also mythical)
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

// dex numbers of ultra beasts
export const beasts = [794, 795, 796, 797, 798, 799, 803, 804, 805, 806, 807];

// dex numbers of paradox pokemon
export const paradox = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023];

// the last pokemon in each generation
export const gens = [0, 151, 251, 386, 493, 649, 721, 905, 1025];

// the growth rate used for experience calculation. currently Medium Fast, the most common group
export const expGrowthFunction: GrowthRates = 'mediumFast';

// amount of data points to use to chart the BST curve
export const chartResolution = 100;

// our lord Arceus
export const highestBST = 720;

// Wishiwashi
export const lowestBST = 175;


