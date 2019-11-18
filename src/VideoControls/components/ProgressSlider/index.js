import React, { useRef, useCallback } from 'react';
import { observer } from 'mobx-react';

import { Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useStore } from '../../../store';

import './style.css';
import { formatTime } from '../../../util'

const useStyles = makeStyles({
	root: { padding: '6px 0' },
	rail: { backgroundColor: '#FFF', transition: 'transform .2s linear' },
	thumb: { height: '2px', marginTop: 0, transition: 'transform .2s linear', pointerEvents: 'none' },
	track: { transition: 'transform .2s linear' }
});

const ProgressSlider = observer(() => {
	const { currentTime, duration, skipTo, timeFormat } = useStore();
	const classes = useStyles();
	const sliderRef = useRef(null);

	const handleChange = useCallback((e, newValue) => {
		skipTo(newValue);
	}, [skipTo]);

	const handleMouseMove = useCallback((e) => {
		const { target, clientX } = e;
		if (!target) return;

		const rect = target.getBoundingClientRect();

		const totalWidth = target.offsetWidth;
		const currentWidth = Math.max(clientX - rect.left, 0);
		const totalTime = duration;
		const time = currentWidth * totalTime / totalWidth;

		sliderRef.current.style.setProperty('--mouse-position', `${currentWidth}px`);
		sliderRef.current.setAttribute('data-timestamp', duration ? formatTime(Math.floor(time), timeFormat) : '00:00');
	}, [duration, timeFormat]);

	return (
		<Slider
			ref={(ref) => sliderRef.current = ref}
			className="video-progress"
			classes={classes}
			defaultValue={currentTime}
			value={currentTime}
			min={0}
			max={duration}
			onChange={handleChange}
			onMouseMove={handleMouseMove}
		/>
	);
});

export default ProgressSlider;
