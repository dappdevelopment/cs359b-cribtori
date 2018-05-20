import React, { Component } from 'react'

import { assets } from './assets.js';


class ToriImage extends Component {

  render() {
    let dna = this.props.dna;
    let size = this.props.size;

    let tori = assets.tori;

    // BASE
    let feetBase = tori.feetBase;
    let cheek = tori.cheek;
    let shadow = tori.shadow;

    // BODY
    let idx = dna % 10;
    let body = tori.body[idx % tori.body.length];
    dna = Math.floor(dna / 10);

    // BASE COLOR
    idx = dna % 1000;
    let baseHue = idx % 360;
    let baseSaturate = Math.max(idx - 360, 1) % 200 + 50;
    let baseSephia = (Math.max(idx - 360 - 200, 1)) / (1000 - 360 - 200);
    dna = Math.floor(dna / 1000);

    // EYES
    idx = dna % 10;
    let eyes = tori.eyes[idx % tori.eyes.length];
    dna = Math.floor(dna / 10);

    // MOUTH
    idx = dna % 10;
    let mouth = tori.mouth[idx % tori.mouth.length];
    dna = Math.floor(dna / 10);

    // HAND
    idx = dna % 10;
    let hand = tori.hand[idx % tori.hand.length];
    dna = Math.floor(dna / 10);

    // SECONDARY COLOR
    idx = dna % 1000;
    let secHue = idx % 360;
    let secSaturate = Math.max(idx - 360, 1) % 200 + 50;
    let secSephia = (Math.max(idx - 360 - 200, 1)) / (1000 - 360 - 200);
    dna = Math.floor(dna / 1000);

    // FEET
    idx = dna % 10;
    let feet = tori.feet[idx % tori.feet.length];
    dna = Math.floor(dna / 10);

    // DECOR
    idx = dna % 10;
    let decor = tori.decoration[idx % tori.decoration.length];
    dna = Math.floor(dna / 10);

    // DECOR COLOR
    idx = dna % 1000;
    let decorHue = idx % 360;
    let decorSaturate = Math.max(idx - 360, 1) % 200 + 50;
    let decorSephia = (Math.max(idx - 360 - 200, 1)) / (1000 - 360 - 200);
    dna = Math.floor(dna / 1000);

    let isSpecial = (dna % 3) <= 1;

    let baseTime = 0.5;
    let secTime = 0.6;

    // Handle sharing posiiton.
    let pos = (this.props.sharing) ? 'absolute' : 'relative';
    // Handle transform.
    let perspective = (this.props.sharing === 'host') ?
                      'rotateY(20deg) translateX(-15px)' :
                      (this.props.sharing === 'guest') ?
                      'rotateY(-20deg) translateX(15px)' :
                      '';

    return (
      <div style={{ height: size,
                    width: size,
                    position: pos,
                    margin: `0 auto`,
                    transform: perspective
                  }}>
        <img
          src={feetBase}
          alt="Feet Base"
          style={{
            position: 'absolute',
            zIndex: 50,
            width: `100%`,
            filter: `hue-rotate(${baseHue}deg) saturate(${baseSaturate}%) sepia(${baseSephia})`,
            animation: `animatedTori ${baseTime}s infinite alternate`,
          }} />
        <img
          src={cheek}
          alt="Cheek"
          style={{
            position: 'absolute',
            zIndex: 200,
            width: `100%`,
            animation: `animatedTori ${baseTime}s infinite alternate`,
          }} />
        <img
          src={shadow}
          alt="Shadow"
          style={{
            position: 'absolute',
            zIndex: 50,
            width: `100%`,
          }} />
        <img
          src={body}
          alt="Body"
          style={{
            position: 'absolute',
            zIndex: 150,
            width: `100%`,
            filter: `hue-rotate(${baseHue}deg) saturate(${baseSaturate}%) sepia(${baseSephia})`,
            animation: `animatedTori ${baseTime}s infinite alternate`,
          }} />
        <img
          src={eyes}
          alt="Eyes"
          style={{
            position: 'absolute',
            zIndex: 200,
            width: `100%`,
            animation: `animatedTori ${baseTime}s infinite alternate`,
          }} />
        <img
          src={mouth}
          alt="Mouth"
          style={{
            position: 'absolute',
            zIndex: 200,
            width: `100%`,
            animation: `animatedTori ${baseTime}s infinite alternate`,
          }} />
        <img
          src={hand}
          alt="Hand"
          style={{
            position: 'absolute',
            zIndex: 200,
            width: `100%`,
            filter: `hue-rotate(${secHue}deg) saturate(${secSaturate}%) sepia(${secSephia})`,
            animation: `animatedTori ${secTime}s infinite alternate`,
          }} />
        <img
          src={feet}
          alt="Feet"
          style={{
            position: 'absolute',
            zIndex: 100,
            width: `100%`,
          }} />
        { isSpecial &&
          <img
            src={decor}
            alt="Decoration"
            style={{
              position: 'absolute',
              zIndex: 200,
              width: `100%`,
              filter: `hue-rotate(${decorHue}deg) saturate(${decorSaturate}%) sepia(${decorSephia})`,
              animation: `animatedTori ${baseTime}s infinite alternate`,
            }} />
        }
      </div>
    );
  }
}

export default (ToriImage)
