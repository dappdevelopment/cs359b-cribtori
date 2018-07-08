import FLOOR_0 from './img/background/floor_0.png';
import FLOOR_1 from './img/background/floor_1.png';
import FLOOR_2 from './img/background/floor_2.png';

import WALL_0 from './img/background/wall_0.png';
import WALL_1 from './img/background/wall_1.png';
import WALL_2 from './img/background/wall_2.png';

import DOOR from './img/background/door.png';

// Accessories
import TWC from './img/accessories/TWC.png';
import TWD from './img/accessories/TWD.png';
import TWS from './img/accessories/TWS.png';
import TWB from './img/accessories/TWB.png';
import TCC from './img/accessories/TCC.png';
import TWT from './img/accessories/TWT.png';
import TST from './img/accessories/TST.png';
import TFT from './img/accessories/TFT.png';
import TPP from './img/accessories/TPP.png';

// Tori
import CHEEK from './img/tori/cheek.png';
import SHADOW from './img/tori/shadow.png';
import FEET_BASE from './img/tori/feet_base.png';

import BODY_0 from './img/tori/body/0.png';
import BODY_1 from './img/tori/body/1.png';
import BODY_2 from './img/tori/body/2.png';
import BODY_3 from './img/tori/body/3.png';

import DECOR_0 from './img/tori/decoration/0.png';
import DECOR_1 from './img/tori/decoration/1.png';
import DECOR_2 from './img/tori/decoration/2.png';
import DECOR_3 from './img/tori/decoration/3.png';
import DECOR_4 from './img/tori/decoration/4.png';
import DECOR_5 from './img/tori/decoration/5.png';

import EYES_0 from './img/tori/eyes/0.png';
import EYES_1 from './img/tori/eyes/1.png';
import EYES_2 from './img/tori/eyes/2.png';
import EYES_3 from './img/tori/eyes/3.png';

import FEET_0 from './img/tori/feet/0.png';
import FEET_1 from './img/tori/feet/1.png';
import FEET_2 from './img/tori/feet/2.png';

import HAND_0 from './img/tori/hand/0.png';
import HAND_1 from './img/tori/hand/1.png';
import HAND_2 from './img/tori/hand/2.png';
import HAND_3 from './img/tori/hand/3.png';
import HAND_4 from './img/tori/hand/4.png';

import MOUTH_0 from './img/tori/mouth/0.png';
import MOUTH_1 from './img/tori/mouth/1.png';
import MOUTH_2 from './img/tori/mouth/2.png';
import MOUTH_3 from './img/tori/mouth/3.png';

import S_KITTY from './img/tori/special/kitty.png';
import S_TREE from './img/tori/special/tree.png';
import S_MENTOR from './img/tori/special/mentor.png';

import FEED from './img/food.png';
import CLEAN from './img/clean.png';

import FUSE from './img/accessories/TPP.png';
import BREED from './img/accessories/TPP.png';

import LOGO from './img/Logo.png';
import LOGO_WHITE from './img/Logo_white.png';
import INFO1 from './img/info1.png';
import INFO2 from './img/info2.png';
import INFO3 from './img/info3.png';
import INFO4 from './img/info4.png';

import PENDING from './img/Pending.png';

import BUBBLE from './img/reactions/bubble.png';
import HEARTS from './img/reactions/hearts.png';
import FOOD from './img/reactions/food.png';
import NOTE from './img/reactions/note.png';
import SAD from './img/reactions/sad.png';
import SMILE from './img/reactions/smile.png';
import SURPRISED from './img/reactions/surprised.png';
import WATER from './img/reactions/water.png';

export const assets = {
  background: {
    floor: [
      FLOOR_0, FLOOR_1, FLOOR_2
    ],
    wall: [ WALL_0, WALL_1, WALL_2 ],
    door: DOOR,
  },
  accessories: {
    TWC: TWC,
    TWD: TWD,
    TWS: TWS,
    TWB: TWB,
    TCC: TCC,
    TWT: TWT,
    TST: TST,
    TFT: TFT,
    TPP: TPP
  },
  tori: {
    cheek: CHEEK,
    feetBase: FEET_BASE,
    shadow: SHADOW,
    body: [
      BODY_0, BODY_1, BODY_2, BODY_3
    ],
    decoration: [
      DECOR_0, DECOR_1, DECOR_2, DECOR_3, DECOR_4, DECOR_5
    ],
    eyes: [
      EYES_0, EYES_1, EYES_2, EYES_3
    ],
    feet: [
      FEET_0, FEET_1, FEET_2
    ],
    hand: [
      HAND_0, HAND_1, HAND_2, HAND_3, HAND_4
    ],
    mouth: [
      MOUTH_0, MOUTH_1, MOUTH_2//, MOUTH_3
    ],
    special: {
      'kitty': S_KITTY,
      'tree': S_TREE,
      'mentor': S_MENTOR
    }
  },
  food: FEED,
  clean: CLEAN,
  fuse: FUSE,
  breed: BREED,
  logo: LOGO,
  logoWhite: LOGO_WHITE,
  info: [INFO1, INFO2, INFO3, INFO4],
  pending: PENDING,
  reactions: {
    'bubble': BUBBLE,
    'food': FOOD,
    'hearts': HEARTS,
    'note': NOTE,
    'sad': SAD,
    'smile': SMILE,
    'surprised': SURPRISED,
    'water': WATER,
  }
};
