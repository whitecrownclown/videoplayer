import React from 'react';
import { observer } from 'mobx-react';

import { Slider, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useStore } from '../../../store';

import './style.css';
import { formatTime } from '../../../util'

const useStyles = makeStyles({
	root: { padding: '6px 0' },
	rail: { backgroundColor: '#FFF', transition: 'transform .2s linear' },
	thumb: { height: '2px', marginTop: 0, transition: 'transform .2s linear' },
	track: { transition: 'transform .2s linear' }
});

function ValueLabelComponent(props) {
	const { children, open, value } = props;
	const { timeFormat } = useStore();

	const popperRef = React.useRef(null);
	React.useEffect(() => {
		if (popperRef.current) {
			popperRef.current.update();
		}
	});

	return (
		<Tooltip
			PopperProps={{
				popperRef,
			}}
			open={open}
			enterTouchDelay={0}
			placement="top"
			title={formatTime(value, timeFormat)}
		>
			{children}
		</Tooltip>
	);
}

const Progress = observer(() => {
	const { currentTime, duration, jumpInTime } = useStore();
	const classes = useStyles();

	const handleChange = (e, newValue) => {
		jumpInTime(newValue);
	};

	return (
		<Slider
			className="video-progress"
			valueLabelDisplay="auto"
			ValueLabelComponent={ValueLabelComponent}
			classes={classes}
			defaultValue={currentTime}
			value={currentTime}
			min={0}
			max={duration}
			onChange={handleChange}
		/>
	);
});

export default Progress;
