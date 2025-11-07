import p5 from "p5";
import "p5/lib/addons/p5.sound";
import '@/lib/p5.randomColor.js';
import { Midi } from '@tonejs/midi';
import { LandscapesGrid } from './classes/LandscapesGrid.js';
import JSZip from 'jszip';

const base = import.meta.env.BASE_URL || './';
const audio = base + 'audio/LandscapesNo2.mp3';
const midi = base + 'audio/LandscapesNo2.mid';

const sketch = (p) => {
  /** 
   * Core audio properties
   */
  p.song = null;
  p.audioSampleRate = 0;
  p.totalAnimationFrames = 0;
  p.PPQ = 3840 * 4;
  p.bpm = 97;
  p.audioLoaded = false;
  p.songHasFinished = false;
  /** 
   * Capture properties
   */
  p.captureFilePrefix = 'LandscapesNo2';
  p.captureEnabled = true;
  p.frameNumber = 0;
  p.capturedFrames = [];
  p.captureInProgress = false;
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

   p.captureFrame = () => {
    const canvasElt = p.canvas?.elt ?? p.canvas;

    const frameNum = p.frameNumber++;

    return new Promise((resolve) => {
      canvasElt.toBlob((blob) => {
        if (blob) {
          p.capturedFrames.push({
            blob,
            frameNumber: frameNum,
            filename: `${p.captureFilePrefix}_${p.nf(frameNum, 5)}.png`
          });
        }
        resolve();
      }, 'image/png');
    });
  };

  p.startCapture = () => {
    if (p.captureInProgress || !p.captureEnabled) return;
    p.capture().catch((error) => {
      console.error('Capture failed:', error);
      p.captureInProgress = false;
    });
  };

  p.capture = async () => {
    p.captureInProgress = true;
    p.capturedFrames = [];
    p.frameNumber = 0;

    const cues = p.song._cues.slice().sort((a, b) => a.time - b.time);
    let cueIndex = 0;

    p.song._lastPos = 0;
 
    for (let frame = 0; frame < p.totalAnimationFrames; frame++) {
      const frameTime = frame / 60;

      if (cueIndex < cues.length && cues[cueIndex].time <= frameTime) {
        const cue = cues[cueIndex];
        cue.callback.call(cue.scope || p, cue.val);
        cueIndex++;
      }

      p.song._lastPos = Math.max(0, frameTime * p.audioSampleRate);

      if (p.currentLandscapes) {
        p.currentLandscapes.update();
        p.currentLandscapes.draw();
      }

      await p.captureFrame();
    }

    p.captureInProgress = false;

    console.log(`Capture complete. Captured ${p.capturedFrames.length} frames.`);
    await p.downloadFrames();
  };

  p.downloadFrames = async () => {
    if (p.capturedFrames.length === 0) {
      console.log('No frames to download');
      return;
    }

    console.log(`Creating ZIP with ${p.capturedFrames.length} frames...`);
    
    p.capturedFrames.sort((a, b) => a.frameNumber - b.frameNumber);
    
    const zip = new JSZip();
    
    for (let i = 0; i < p.capturedFrames.length; i++) {
      const frame = p.capturedFrames[i];
      const arrayBuffer = await frame.blob.arrayBuffer();
      zip.file(frame.filename, arrayBuffer);
      
      if ((i + 1) % 100 === 0) {
        console.log(`Added ${i + 1} / ${p.capturedFrames.length} frames...`);
      }
    }

    console.log('Generating ZIP file...');

    const ffmpegCommandLines = [
      `# Standard quality (visually lossless)`,
      `ffmpeg -framerate 60 -i ${p.captureFilePrefix}_%05d.png -c:v libx264 -crf 18 -preset slow ${p.captureFilePrefix}.mp4`,
      ``,
      `# Lossless (very large file)`,
      `ffmpeg -framerate 60 -i ${p.captureFilePrefix}_%05d.png -c:v libx264 -crf 0 -preset slow ${p.captureFilePrefix}_lossless.mp4`
    ].join('\n');
    zip.file('ffmpeg_command.txt', ffmpegCommandLines);

    const zipBlob = await zip.generateAsync({ 
      type: 'blob'
    });
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.captureFilePrefix}_frames_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log(`Downloaded ZIP with ${p.capturedFrames.length} frames`);
    
    p.capturedFrames = [];
    p.frameNumber = 0;
  };

  /** 
   * Preload function - Loading audio and setting up MIDI
   * This runs first, before setup()
   */
  p.preload = () => {
      p.song = p.loadSound(audio, (sound) => {
          p.audioSampleRate = sound.sampleRate();
          p.totalAnimationFrames = Math.floor(sound.duration() * 60);
          p.totalAnimationFrames = 50;
          p.loadMidi();
      });
      p.song.onended(() => {
          p.songHasFinished = true;
          if (p.canvas) {
              p.canvas.classList.add('p5Canvas--cursor-play');
              p.canvas.classList.remove('p5Canvas--cursor-pause');
          }
          if (p.captureEnabled && p.captureInProgress) {
              p.captureInProgress = false;
              p.downloadFrames();
          }
      });
  };


  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    p.rectMode(p.CENTER);
    p.nightMode = true;
    p.colorPalette = p.generatePalette();
    p.landscapes = Array.from({ length: 72 }, () => new LandscapesGrid(p));
    p.currentLandscapeIndex = -1;
    const randomIndex = p.floor(p.random(12));
    p.currentLandscapes = p.landscapes[randomIndex];
    p.currentLandscapes.setFullDisplayMode(true);
    if (p.captureEnabled) {
      p.noLoop();
    }
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
    const { durationTicks } = note;
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
      if (p.captureEnabled) {
        p.startCapture();
        return;
      } else if (p.song.isPlaying()) {
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
   * Handles key press events
   * and saves the sketch as a PNG
   * if the user presses Ctrl + S
   */
  p.keyPressed = () => {
    if (p.keyIsDown(p.CONTROL) && p.key === 's') {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      p.save(`sketch-3_${timestamp}.png`);
      return false;
    }
  };

  /**
   * Resize the canvas when the window is resized
   * and redraw
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

};

new p5(sketch);
