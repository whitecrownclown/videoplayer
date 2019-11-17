import React, { useEffect, useRef } from 'react';
import { CircularProgress, Icon } from '@material-ui/core';
import { PlayCircleFilled, PauseCircleFilled } from '@material-ui/icons';
import { observer, } from 'mobx-react';

import './style.css'

import { useStore } from '../store';

const VideoOverlay = observer(() => {
	const { buffering, isPlaying } = useStore();
	const iconRef = useRef(null);

	useEffect(() => {
		// Avoid on mount animation
		iconRef.current.classList.add('hidden-animation');
	}, []);

	return (
		<div className="video-overlay">
			{
				buffering ?
					<CircularProgress /> :
					<Icon
						ref={(ref) => iconRef.current = ref}
						component={isPlaying ? PlayCircleFilled : PauseCircleFilled}
						className="status-animation"
					/>
			}
		</div>
	);
});

export default VideoOverlay;
