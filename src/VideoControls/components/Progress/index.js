import React, { useRef } from 'react';
import { observer } from 'mobx-react';

import { Slider, Popper } from '@material-ui/core';
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

const Progress = observer(() => {
	const { currentTime, duration, jumpInTime, timeFormat } = useStore();
	const classes = useStyles();
	const sliderRef = useRef(null);

	const handleChange = (e, newValue) => {
		jumpInTime(newValue);
	};

	const handleMouseMove = (e) => {
		const { target, clientX } = e;
		if (!target) return;

		const rect = target.getBoundingClientRect();

		const totalWidth = target.offsetWidth;
		const currentWidth = clientX - rect.left;
		const totalTime = duration;
		const time = currentWidth * totalTime / totalWidth;

		sliderRef.current.style.setProperty('--mouse-position', `${currentWidth}px`);
		sliderRef.current.setAttribute('data-position', formatTime(Math.floor(time), timeFormat));
	}

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

export default Progress;
