import React, { createRef, useEffect } from 'react';
import { decorate, observable, computed, action } from "mobx";
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
    constructor() {
        this.videoEl = createRef(null);
        this.showControls = false;
        this.isPlaying = false;
        this.isFullscreen = false;
        this.muted = false;
        this.volume = 100;
        this.duration = null;
        this.currentTime = 0;
        this.buffering = false;
        this.loadProgress = 0;
        this.playbackRate = 1;

        this.timeFormat = {
            hours: true,
            minutes: true,
            seconds: true
        };

        this.autoHideControlsTimer = null;

        this.onMouseMove = throttle(this.handleControlsAutoHide, 200, { leading: true, trailing: false });
    }

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

    skipTo(value) {
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

    setPlaybackRate = (value) => {
        this.playbackRate = value;
        this.videoEl.current.playbackRate = value;
    }

    setPause = () => {
        this.isPaused = true;
        this.isPlaying = false;
    }

    setMuted(value) {
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
        videoElement.addEventListener('keypress', this.handleKeyboardShortcuts);
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
        videoElement.removeEventListener('keypress', this.handleKeyboardShortcuts);
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

    handleProgress = () => {
        const { current: videoElement } = this.videoEl;
        let range = 0;
        const buffer = videoElement.buffered;
        const currentTime = videoElement.currentTime;

        while (!(buffer.start(range) <= currentTime && currentTime <= buffer.end(range))) {
            range += 1;
        }

        const loadStartPercentage = buffer.start(range) / videoElement.duration;
        const loadEndPercentage = buffer.end(range) / videoElement.duration;
        const loadPercentage = loadEndPercentage - loadStartPercentage;

        this.loadProgress = loadPercentage;
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

    handleVolumeChange = throttle((e) => {
        this.volume = e.target.volume;
        this.muted = e.target.muted;
    }, 200, { leading: true, trailing: true })

    handleTimeUpdate = throttle((e) => {
        this.currentTime = Math.round(e.target.currentTime);

        return this.currentTime;
    }, 200, { leading: true });

    pause() {
        this.videoEl.current.pause();
    }

    setVolume(value) {
        this.videoEl.current.volume = value;
        this.setMuted(value === 0);
    }

    handleControlsAutoHide() {
        clearTimeout(this.autoHideControlsTimer);

        this.showControls = true;
        this.autoHideControlsTimer = setTimeout(() => {
            if (!this.videoEl.current.paused) {
                this.onMouseLeave();
            }
        }, AUTO_HIDE_CONTROLS_TIME);
    }

    onClick() {
        this.handleControlsAutoHide();

        if (this.videoEl.current.paused) {
            this.videoEl.current.play();
        } else {
            this.videoEl.current.pause();
        }
    }

    onDoubleClick = this.toggleFullscreen;

    toggleFullscreen() {
        if (document.fullscreenElement === this.videoEl.current.parentNode) {
            document.exitFullscreen();
        } else {
            this.videoEl.current.parentNode.requestFullscreen();
        }
    }

    onMouseEnter() {
        this.handleControlsAutoHide();
    }

    onMouseOver() {
        this.handleControlsAutoHide();
    }

    onMouseLeave() {
        clearTimeout(this.autoHideControlsTimer);
        if (this.isPlaying) {
            this.showControls = false;
        }
    }
}

decorate(VideoPlayer, {
    formattedDuration: computed,
    videoEl: observable,
    duration: observable,
    currentTime: observable,
    isFullscreen: observable,
    ended: observable,
    muted: observable,
    volume: observable,
    buffering: observable,
    showControls: observable,
    isPlaying: observable,
    loadProgress: observable,
    timeFormat: observable,
    onClick: action.bound,
    onDoubleClick: action.bound,
    onMouseEnter: action.bound,
    onMouseOver: action.bound,
    onMouseLeave: action.bound,
    onMouseMove: action.bound,
    setMuted: action.bound,
    setVolume: action.bound,
    getVolume: action.bound,
    skipTo: action.bound,
    toggleFullscreen: action.bound
});

const VideoPlayerView = observer((props) => {
    const { onClick, onDoubleClick, videoEl, onMouseEnter, onMouseLeave, onMouseOver, onMouseMove, showControls, attachEvents, detachEvents } = useStore();
    const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick({ onClick, onDoubleClick });

    useEffect(() => {
        attachEvents();

        return () => {
            detachEvents();
        };
    }, [attachEvents, detachEvents]);

    return (
        <div className="video-wrapper" style={{
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
