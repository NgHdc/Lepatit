export interface StoryData {
    title: string;
    text: string;
}

export interface StoryDatabase {
    [key: string]: StoryData;
}

export const CONFIG = {
    colors: {
        // --- CLAYMATION GOTHIC PALETTE ---
        water: 0x0a1a2a,       // Deep muted ocean
        waterVolume: 0x051015, // Dark underwater
        glass: 0xd4c4b0,       // Aged glass/clay white
        moon: 0xf5e6c8,        // Warm cream/amber moon
        moonlight: 0x8a7a6a,   // Warm muted moonlight
        fog: 0x0a0812,         // Deep purple-black fog
        neon: 0x7af0d0,        // Muted teal glow (less harsh)
        floor: 0x2a2520,       // Warm dark clay
        desk: 0x4a3828,        // Rich brown clay
        stardust: 0xc8b090,    // Warm cream dust

        // Clay material colors
        clay: 0x8b7355,        // Base clay brown
        clayDark: 0x5a4a3a,    // Shadow clay
        clayLight: 0xa89070,   // Highlight clay

        // Gothic sky
        skyTop: 0x0a0a1a,      // Warm dark purple
        skyBottom: 0x1a2a3a,   // Muted teal-gray
        skyBand: 4.0           // Fewer bands for chunkier look
    },

    // Stop-motion settings
    stopMotion: {
        fps: 12,               // Classic stop-motion frame rate
        jitterAmount: 0.003,   // Subtle position jitter
        grainIntensity: 0.05   // Film grain amount
    }
};

export const STORY_DB: StoryDatabase = {
    "Antenna": {
        title: "Nov 13, 2025 - The Signal",
        text: "An wrestled with the metal skeleton for what felt like an eternity. The ancient bolts groaned like old bones. 'Twenty seconds,' she whispered. She waited. There was nothing but the hum of the dying machine and the sea, endlessly breaking against the shore of nowhere."
    },
    "Computer": {
        title: "The Digital Witch",
        text: "An dove into the screen, a pool of neon and numbers. She typed commands like casting spells, old magic for a broken world. The code flowed through her veins, a digital pulse in a dead quiet room."
    },
    "Cassette": {
        title: "Adam's Ghost",
        text: "'Come down for dinner, An...' Adam was the first machine to learn how to weep. A father stitched together from scraps of metal and kindness. This tape holds his voice, a ghost caught in magnetic ribbon."
    },
    "Water": {
        title: "The Memory Tank",
        text: "The ocean is no longer infinite. It has been captured, condensed, and preserved in a glass box. A specimen of a world that used to be wild."
    },
    "Floor": {
        title: "The Floating Isle",
        text: "A slab of concrete adrift in the ether. It is the only solid thing in a fluid world, a sanctuary suspended between the deep water and the silent stars."
    },
    "Moon": {
        title: "The Silent Watcher",
        text: "The moon hangs heavy and close, a pale eye that never blinks. In this dream, the Earth is the moon, desolate and beautiful."
    },
    "Glass": {
        title: "The Barrier",
        text: "Invisible walls separate us from the void. We are safe inside, or perhaps we are the ones on display?"
    }
};