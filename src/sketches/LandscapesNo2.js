import p5 from "p5";
import "p5/lib/addons/p5.sound";
import '@/lib/p5.randomColor.js';
import { Midi } from '@tonejs/midi';
import { LandscapesGrid } from './classes/LandscapesGrid.js';

const base = import.meta.env.BASE_URL || './';
const audio = base + 'audio/LandscapesNo2.mp3';
const midi = base + 'audio/LandscapesNo2.mid';

const sketch = (p) => {
  /** 
   * Core audio properties
   */
  p.song = null;
  p.PPQ = 3840 * 4;
  p.bpm = 97;
  p.audioLoaded = false;
  p.songHasFinished = false;

  /** 
   * MIDI loading and processing
   * Handles synchronization between audio and visuals
   */
  p.loadMidi = () => {
      Midi.fromUrl(midi).then((result) => {
          console.log('MIDI loaded:', result);
          const track1 = result.tracks[0].notes; 
          const track2 = result.tracks[1].notes; 
          p.scheduleCueSet(track1, 'executeTrack1');
          p.scheduleCueSet(track2, 'executeTrack2');
          document.getElementById("loader").classList.add("loading--complete");
          document.getElementById('play-icon').classList.add('fade-in');
          p.audioLoaded = true;
      });
  };

  /** 
   * Schedule MIDI cues to trigger animations
   * @param {Array} noteSet - Array of MIDI notes
   * @param {String} callbackName - Name of the callback function to execute
   * @param {Boolean} polyMode - Allow multiple notes at same time if true
   */
  p.scheduleCueSet = (noteSet, callbackName, polyMode = false) => {
      let lastTicks = -1,
          currentCue = 1;
      for (let i = 0; i < noteSet.length; i++) {
          const note = noteSet[i],
              { ticks, time } = note;
          if(ticks !== lastTicks || polyMode){
              note.currentCue = currentCue;
              p.song.addCue(time, p[callbackName], note);
              lastTicks = ticks;
              currentCue++;
          }
      }
  }


  /** 
   * Preload function - Loading audio and setting up MIDI
   * This runs first, before setup()
   */
  p.preload = () => {
      p.song = p.loadSound(audio, p.loadMidi);
      p.song.onended(() => {
          p.songHasFinished = true;
          if (p.canvas) {
              p.canvas.classList.add('p5Canvas--cursor-play');
              p.canvas.classList.remove('p5Canvas--cursor-pause');
          }
      });
  };


  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.rectMode(p.CENTER);
    p.nightMode = p.random() < 0.5;
    p.colorPalette = p.generatePalette();
    p.landscapes = Array.from({ length: 72 }, () => new LandscapesGrid(p));
    p.currentLandscapeIndex = -1;
    p.currentLandscapes = new LandscapesGrid(p);
    p.currentLandscapes.setFullDisplayMode(true);
  };

  p.draw = () => {
    if (p.song && p.song.isPlaying() && p.currentLandscapes) {
      p.currentLandscapes.update();
    }
    if (p.currentLandscapes) {
      p.currentLandscapes.draw();
    }
  };

  p.executeTrack1 = (note) => {
    const { currentCue, durationTicks } = note;
    const duration = (durationTicks / p.PPQ) * (60 / p.bpm);

    p.clear();

    p.currentLandscapeIndex++;
    p.nightMode = false;
    p.currentLandscapes = p.landscapes[p.currentLandscapeIndex];

    p.currentLandscapes.fullDisplay = false;

    p.currentLandscapes.init(duration * 0.8);
  };

   p.executeTrack2 = (note) => {
    const { currentCue, durationTicks } = note;
    const duration = (durationTicks / p.PPQ) * (60 / p.bpm);

    p.clear();

    p.currentLandscapeIndex++;
    p.nightMode = true;
    p.currentLandscapes = p.landscapes[currentCue - 1];

    p.currentLandscapes.fullDisplay = false;

    p.currentLandscapes.init(duration * 0.8);
  };

  p.generatePalette = () => {
    const darkPalette = p.randomColor({ count: 12, luminosity: 'dark' });
    p.shuffle(darkPalette);

    const lightPalette = p.randomColor({ count: 12, luminosity: 'light' });
    p.shuffle(lightPalette);

    return { dark: darkPalette, light: lightPalette };
  };

  /**
   * Handle mouse/touch interaction - toggle night mode
   */
  p.mousePressed = () => {
    if(p.audioLoaded){
      if (p.song.isPlaying()) {
          p.song.pause();
          p.canvas.classList.add('p5Canvas--cursor-play');
          p.canvas.classList.remove('p5Canvas--cursor-pause');
      } else {
          if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
              /** 
               * Reset animation properties here
               */
          }
          document.getElementById("play-icon").classList.remove("fade-in");
          p.song.play();
          p.showingStatic = false;
          p.currentLandscapes = p.landscapes[0];
          p.canvas.classList.add('p5Canvas--cursor-pause');
          p.canvas.classList.remove('p5Canvas--cursor-play');
      }
  }
  }

  /**
   * Resize the canvas when the window is resized
   * and redraw
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

};

new p5(sketch);
