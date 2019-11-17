import React from 'react';
import { observer } from 'mobx-react';
import cx from 'classnames';
import './style.css';

import { Grid } from '@material-ui/core';
import { useStore } from '../store';

import ProgressSlider from './components/ProgressSlider';
import Right from './sections/Right';
import Left from './sections/Left';

const VideoControls = observer(props => {
	const { showControls, } = useStore();

	return (
		<div className={cx('video-controls', { show: showControls })} {...props}>
			<Grid container direction="column" className="bottom-section">
				<Grid item container direction="row">
					<ProgressSlider />
				</Grid>
				<Grid
					container
					item
					direction="row"
					justify="flex-start"
					alignItems="center"
					{...props}
				>
					<Left />
					<Right />
				</Grid>
			</Grid>
		</div >
	);
});

export default VideoControls;
