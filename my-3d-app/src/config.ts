export interface StoryData {
    title: string;
    text: string;
}

export interface StoryDatabase {
    [key: string]: StoryData;
}

export const CONFIG = {
    colors: {
        water: 0x001e36, 
        waterVolume: 0x001122, // Màu cho phần thân nước bên dưới (đậm hơn mặt nước)
        glass: 0xffffff,       // Màu kính
        moon: 0xffffcc,      
        moonlight: 0x667788, 
        fog: 0x050510,       
        neon: 0x00ffff,  
        floor: 0x111115,
        desk: 0x2c2018,
        stardust: 0x88ccff,    // Màu bụi sao
        
        skyTop: 0x000022,    
        skyBottom: 0x224466, 
        skyBand: 5.0         
    },
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