import React, { createRef, useEffect } from 'react';
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react";
import throttle from 'lodash.throttle';
import { useClickPreventionOnDoubleClick } from '../hooks';
import { BUFFERING_LEEWAY, AUTO_HIDE_CONTROLS_TIME } from '../constants';
import { formatTime } from '../util'

import './style.css';

import { useStore } from '../store';
import VideoControls from '../VideoControls';
import VideoOverlay from '../VideoOverlay';

class VideoPlayer {
    @observable videoEl = createRef(null);
    @observable showControls = false;
    @observable isPlaying = false;
    @observable isFullscreen = false;
    @observable muted = false;
    @observable volume = 100;
    @observable duration = null;
    @observable currentTime = 0;
    @observable buffering = false;
    @observable loadProgress = 0;
    @observable playbackRate = 1;
    @observable buffered = 0;
    @observable timeFormat = {
        hours: true,
        minutes: true,
        seconds: true
    };
    autoHideControlsTimer = null;

    @computed
    get formattedDuration() {
        return formatTime(this.duration, this.timeFormat);
    }

    onLoadedData = (e) => {
        const { duration } = e.target;
        this.timeFormat = {
            hours: duration > 3600,
            minutes: duration > 60,
            seconds: duration > 0
        }
        this.duration = duration;
    }

    @action
    skipTo = (value) => {
        this.currentTime = value;
        this.videoEl.current.currentTime = value;
    }

    setIsFullscreen = () => {
        this.isFullscreen = document.fullscreenElement === this.videoEl.current.parentNode;
    };

    setPlaying = () => {
        if (this.ended) {
            this.ended = false;

            this.skipTo(0);
        }

        this.isPaused = false;
        this.isPlaying = true;
    }

    @action
    setPlaybackRate = (value) => {
        this.playbackRate = value;
        this.videoEl.current.playbackRate = value;
    }

    setPause = () => {
        this.isPaused = true;
        this.isPlaying = false;
    }

    @action
    setMuted = (value) => {
        this.videoEl.current.muted = value;
    }

    attachEvents = () => {
        const { current: videoElement } = this.videoEl;

        videoElement.addEventListener('play', this.setPlaying);
        videoElement.addEventListener('pause', this.setPause);
        videoElement.addEventListener('loadeddata', this.onLoadedData);
        videoElement.addEventListener('timeupdate', this.handleTimeUpdate);
        videoElement.addEventListener('volumechange', this.handleVolumeChange);
        videoElement.addEventListener('waiting', this.handleStartBuffering);
        videoElement.addEventListener('playing', this.handleStopBuffering);
        videoElement.addEventListener('ended', this.handleEnded);
        videoElement.addEventListener('progress', this.handleProgress);
        videoElement.parentNode.addEventListener('keydown', this.handleKeyboardShortcuts);
        videoElement.parentNode.addEventListener('fullscreenchange', this.setIsFullscreen);
    }

    detachEvents = () => {
        const { current: videoElement } = this.videoEl;

        videoElement.removeEventListener('play', this.setPlaying);
        videoElement.removeEventListener('pause', this.setPause);
        videoElement.removeEventListener('timeupdate', this.handleTimeUpdate);
        videoElement.removeEventListener('volumechange', this.handleVolumeChange);
        videoElement.removeEventListener('waiting', this.handleStartBuffering);
        videoElement.removeEventListener('playing', this.handleStopBuffering);
        videoElement.removeEventListener('ended', this.handleEnded);
        videoElement.removeEventListener('progress', this.handleProgress);
        videoElement.parentNode.removeEventListener('keydown', this.handleKeyboardShortcuts);
        videoElement.parentNode.removeEventListener('fullscreenchange', this.setIsFullscreen);
    }

    handleKeyboardShortcuts = (e) => {
        const keyName = e.key.toLowerCase();

        if (keyName === 'f') {
            this.toggleFullscreen();
        } else if (keyName === 'm') {
            this.setMuted(!this.muted);
        } else if ([' ', 'spacebar', 'k'].includes(e.key)) {
            this.onClick();
        }
    }

    handleProgress = (e) => {
        const videoElement = e.target;

        if (videoElement.duration > 0) {
          for (let i = 0; i < videoElement.buffered.length; i++) {
                if (videoElement.buffered.start(videoElement.buffered.length - 1 - i) < videoElement.currentTime) {
                    this.buffered = (videoElement.buffered.end(videoElement.buffered.length - 1 - i) / videoElement.duration) * 100
                    break;
                }
            }
        }
      };

    handleEnded = () => {
        this.ended = true;
    };

    handleStartBuffering = () => {
        clearTimeout(this.bufferingTimeout);
        this.bufferingTimeout = setTimeout(() => {
            this.buffering = true;
        }, BUFFERING_LEEWAY);
    };

    handleStopBuffering = () => {
        clearTimeout(this.bufferingTimeout);
        this.buffering = false;
    };

    @action
    handleVolumeChange = throttle((e) => {
        this.volume = e.target.volume;
        this.muted = e.target.muted;
    }, 200, { leading: true, trailing: true })

    handleTimeUpdate = throttle((e) => {
        this.currentTime = Math.round(e.target.currentTime);

        return this.currentTime;
    }, 200, { leading: true });

    pause = () => {
        this.videoEl.current.pause();
    }

    @action
    setVolume = (value) => {
        this.videoEl.current.volume = value;
        this.setMuted(value === 0);
    }

    @action
    handleControlsAutoHide = () => {
        clearTimeout(this.autoHideControlsTimer);

        this.showControls = true;
        this.autoHideControlsTimer = setTimeout(() => {
            if (!this.videoEl.current.paused) {
                this.onMouseLeave();
            }
        }, AUTO_HIDE_CONTROLS_TIME);
    }

    onMouseMove = throttle(this.handleControlsAutoHide, 200, { leading: true, trailing: false });

    @action
    onClick= () => {
        this.handleControlsAutoHide();

        if (this.videoEl.current.paused) {
            this.videoEl.current.play();
        } else {
            this.videoEl.current.pause();
        }
    }

    @action
    onDoubleClick = () => this.toggleFullscreen();

    @action
    toggleFullscreen = () => {
        if (document.fullscreenElement === this.videoEl.current.parentNode) {
            document.exitFullscreen();
        } else {
            this.videoEl.current.parentNode.requestFullscreen();
        }
    }

    @action
    onMouseEnter = () => {
        this.handleControlsAutoHide();
    }

    @action
    onMouseOver = () => {
        this.handleControlsAutoHide();
    }

    @action
    onMouseLeave = () => {
        clearTimeout(this.autoHideControlsTimer);
        if (this.isPlaying) {
            this.showControls = false;
        }
    }
}

const VideoPlayerView = observer((props) => {
    const { onClick, onDoubleClick, videoEl, onMouseEnter, onMouseLeave, onMouseOver, onMouseMove, showControls, attachEvents, detachEvents } = useStore();
    const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick({ onClick, onDoubleClick });

    useEffect(() => {
        attachEvents();

        return () => {
            detachEvents();
        };
    }, [attachEvents, detachEvents]);

    useEffect(() => {
        videoEl.current.parentNode.focus();
    }, [videoEl]);

    return (
        <div tabIndex={-1} className="video-wrapper" style={{
            cursor: showControls ? 'default' : 'none'
        }} {...{ onMouseLeave, onMouseMove }}>
            <VideoOverlay />
            <video
                ref={videoEl}
                playsInline
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                {...{ onMouseEnter, onMouseOver }}
                {...props}
            />
            <VideoControls />
        </div >
    );
});

export { VideoPlayer, VideoPlayerView };