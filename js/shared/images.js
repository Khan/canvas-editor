if (!i18n._) {
    i18n._ = function(msg) {
        return msg;
    };
}

// The master list of acceptable images
// Build a list of all the available images
window.OutputImages = [
    {
        groupName: "avatars",
        images: "aqualine-sapling aqualine-seed aqualine-seedling aqualine-tree aqualine-ultimate avatar-team duskpin-sapling duskpin-seed duskpin-seedling duskpin-tree duskpin-ultimate leaf-blue leaf-green leaf-grey leaf-orange leaf-red leaf-yellow leafers-sapling leafers-seed leafers-seedling leafers-tree leafers-ultimate marcimus marcimus-orange marcimus-purple marcimus-red mr-pants mr-pants-green mr-pants-orange mr-pants-pink mr-pants-purple mr-pants-with-hat mr-pink mr-pink-green mr-pink-orange old-spice-man old-spice-man-blue orange-juice-squid piceratops-sapling piceratops-seed piceratops-seedling piceratops-tree piceratops-ultimate primosaur-sapling primosaur-seed primosaur-seedling primosaur-tree primosaur-ultimate purple-pi purple-pi-pink purple-pi-teal questionmark robot_female_1 robot_female_2 robot_female_3 robot_male_1 robot_male_2 robot_male_3 spunky-sam spunky-sam-green spunky-sam-orange spunky-sam-red starky-sapling starky-seed starky-seedling starky-tree starky-ultimate".split(" ")
    },
    {
        groupName: "creatures",
        images: "Hopper-Happy Hopper-Cool Hopper-Jumping OhNoes OhNoes-Happy OhNoes-Hmm BabyWinston Winston".split(" ")
    },
    {
        groupName: "cute",
        images: "Blank BrownBlock CharacterBoy CharacterCatGirl CharacterHornGirl CharacterPinkGirl CharacterPrincessGirl ChestClosed ChestLid ChestOpen DirtBlock DoorTallClosed DoorTallOpen EnemyBug GemBlue GemGreen GemOrange GrassBlock Heart Key PlainBlock RampEast RampNorth RampSouth RampWest Rock RoofEast RoofNorth RoofNorthEast RoofNorthWest RoofSouth RoofSouthEast RoofSouthWest RoofWest Selector ShadowEast ShadowNorth ShadowNorthEast ShadowNorthWest ShadowSideWest ShadowSouth ShadowSouthEast ShadowSouthWest ShadowWest Star StoneBlock StoneBlockTall TreeShort TreeTall TreeUgly WallBlock WallBlockTall WaterBlock WindowTall WoodBlock".split(" "),
        cite: i18n._("'Planet Cute' art by Daniel Cook (Lostgarden.com)"),
        citeLink: "http://lostgarden.com/2007/05/dancs-miraculously-flexible-game.html"
    },
    {
        groupName: "space",
        images: "background beetleship collisioncircle girl1 girl2 girl3 girl4 girl5 healthheart minus octopus planet plus rocketship star 0 1 2 3 4 5 6 7 8 9".split(" "),
        cite: i18n._("'Space Cute' art by Daniel Cook (Lostgarden.com)"),
        citeLink: "http://lostgarden.com/2007/03/spacecute-prototyping-challenge.html"
    }
];

window.ExtendedOutputImages = [
    {
        className: "Clipart",
        groups: OutputImages
    },
    {
        className: "Photos",
        groups: [
            {
                groupName: "animals",
                thumbsDir: "/thumbs",
                images: "birds_rainbow-lorakeets butterfly butterfly_monarch cat cheetah crocodiles dog_sleeping-puppy dogs_collies fox horse kangaroos komodo-dragon penguins rabbit retriever shark snake_green-tree-boa spider".split(" ")
            },
            {
                groupName: "landscapes",
                thumbsDir: "/thumbs",
                images: "beach-at-dusk beach-in-hawaii beach-sunset beach-waves-at-sunset beach-waves-daytime beach-with-palm-trees beach clouds-from-plane crop-circle fields-of-grain fields-of-wine lake lava lotus-garden mountain_matterhorn mountains-and-lake mountains-in-hawaii mountains-sunset sand-dunes waterfall_niagara-falls".split(" ")
            },
            {
                groupName: "food",
                thumbsDir: "/thumbs",
                images: "bananas berries broccoli brussels-sprouts cake chocolates coffee-beans croissant dumplings fish_grilled-snapper fruits grapes hamburger ice-cream mushroom oysters pasta potato-chips potatoes shish-kebab strawberries sushi tomatoes".split(" ")
            }
        ]
    },
    {
        className: "Holiday ☃",
        groups: [
            {
                groupName: "seasonal",
                thumbsDir: "/thumbs",
                images: "father-winston fireworks-2015 fireworks-in-sky fireworks-over-harbor fireworks-scattered gingerbread-family gingerbread-house gingerbread-houses gingerbread-man hannukah-dreidel hannukah-menorah hopper-elfer hopper-partying hopper-reindeer house-with-lights reindeer snow-crystal1 snow-crystal2 snow-crystal3 snownoes snowy-slope-with-trees stocking-empty xmas-cookies xmas-ornament-boat xmas-ornament-on-tree xmas-ornaments xmas-presents xmas-scene-holly-border xmas-tree-with-presents xmas-tree xmas-wreath".split(" ")
            }
        ]
    }
];

window.AllOutputImages = [];
_.each(ExtendedOutputImages, function(imageClass) {
    Array.prototype.push.apply(window.AllOutputImages, imageClass.groups);
});
