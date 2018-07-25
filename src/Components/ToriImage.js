import React, { Component } from 'react'

import { assets } from '../assets.js';

class ToriImage extends Component {

  constructor(props) {
    super(props);

    // Generate random offset if index is defined.
    let baseIndex = 0;
    let randomOffset = 0;
    if (this.props.index !== undefined) {
      baseIndex = 10 * this.props.index;
      randomOffset = Math.random();
    }

    this.state = {
      baseIndex: baseIndex,
      randomOffset: randomOffset
    }
  }

  render() {
    let dna = this.props.dna;
    let size = this.props.size;
    let special = this.props.special;
    let generation = this.props.generation;

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

    // Whether to show decor or not.
    let isSpecial = (dna % 3) <= 1;

    // Whether it's a special tori or not.
    let specialDecor;

    if (special === 1) specialDecor = assets.tori.special.mentor;
    if (special === 2) {
      specialDecor = assets.tori.special.tree;
      isSpecial = false;
    }
    // if (special === 3) specialDecor = assets.tori.special.kitty;


    let baseTime = 0.5;
    let secTime = 0.6;

    let shouldAnimate = !this.props.still;

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
            left: 0,
            zIndex: this.state.baseIndex + 1,
            width: `100%`,
            filter: `hue-rotate(${baseHue}deg) saturate(${baseSaturate}%) sepia(${baseSephia})`,
            animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={cheek}
          alt="Cheek"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 4,
            width: `100%`,
            animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={shadow}
          alt="Shadow"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 1,
            width: `100%`,
          }} />
        <img
          src={body}
          alt="Body"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 3,
            width: `100%`,
            filter: `hue-rotate(${baseHue}deg) saturate(${baseSaturate}%) sepia(${baseSephia})`,
            animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={eyes}
          alt="Eyes"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 4,
            width: `100%`,
            animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={mouth}
          alt="Mouth"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 4,
            width: `100%`,
            animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={hand}
          alt="Hand"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 4,
            width: `100%`,
            filter: `hue-rotate(${secHue}deg) saturate(${secSaturate}%) sepia(${secSephia})`,
            animation: shouldAnimate ? `animatedTori ${secTime}s infinite alternate` : '',
            animationDelay: `${this.state.randomOffset}s`,
          }} />
        <img
          src={feet}
          alt="Feet"
          style={{
            position: 'absolute',
            left: 0,
            zIndex: this.state.baseIndex + 2,
            width: `100%`,
          }} />
        { isSpecial &&
          <img
            src={decor}
            alt="Decoration"
            style={{
              position: 'absolute',
              left: 0,
              zIndex: this.state.baseIndex + 4,
              width: `100%`,
              filter: `hue-rotate(${decorHue}deg) saturate(${decorSaturate}%) sepia(${decorSephia})`,
              animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
              animationDelay: `${this.state.randomOffset}s`,
            }} />
        }
        { special !== 0 &&
          <img
            src={specialDecor}
            alt="Special decoration"
            style={{
              position: 'absolute',
              left: 0,
              zIndex: this.state.baseIndex + 5,
              width: `100%`,
              animation: shouldAnimate ? `animatedTori ${baseTime}s infinite alternate` : '',
              animationDelay: `${this.state.randomOffset}s`,
            }} />
        }
        { this.props.bubble !== undefined &&
          <div>
            <img
              src={assets.reactions.bubble}
              alt="Bubble"
              style={{
                position: 'absolute',
                left: 0,
                zIndex: this.state.baseIndex + 6,
                width: `100%`,
              }} />
            <img
              src={this.props.bubble}
              alt="Bubble-content"
              style={{
                position: 'absolute',
                left: 0,
                zIndex: this.state.baseIndex + 7,
                width: `100%`,
              }} />
          </div>
        }
      </div>
    );
  }
}

export default (ToriImage)
