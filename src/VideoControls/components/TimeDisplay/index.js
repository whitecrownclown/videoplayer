import React from 'react';
import { observer } from 'mobx-react';
import { Grid } from '@material-ui/core';

import { useStore } from '../../../store';
import { formatTime } from '../../../util';
import './style.css';

const TimeDisplay = observer(() => {
	const { currentTime, timeFormat, duration, formattedDuration } = useStore();

	return duration ? (
		<Grid item className="time-display">
			<span>{`${formatTime(currentTime, timeFormat)} / ${formattedDuration}`}</span>
		</Grid>
		) : null;
});

export default TimeDisplay;
