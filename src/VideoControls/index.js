import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react';
import cx from 'classnames';
import './style.css';

import { makeStyles } from '@material-ui/core/styles';

import { Icon, Grid, Popover, MenuItem, InputLabel, Select, Tooltip } from '@material-ui/core';
import { Pause, PlayArrow, Fullscreen, FullscreenExit, Settings, Replay } from '@material-ui/icons';
import { useStore } from '../store';

import VolumeControls from './components/VolumeControls';
import TimeDisplay from './components/TimeDisplay';
import Progress from './components/Progress';

const usePopoverStyles = makeStyles({
	root: { color: '#fff' },
	paper: { padding: 6, background: 'rgba(0, 0, 0, 0.7)', },
});

const useSelectStyles = makeStyles({
	root: { width: '100%', color: '#fff' },
	select: { width: 'inherit' }
});

const useInputClasses = makeStyles({
	root: {
		width: '100%', color: '#fff', fontSize: 12
	}
})

const VideoControls = observer(props => {
	const { showControls, isPlaying, isFullscreen, onClick, toggleFullscreen, ended } = useStore();
	const anchorEl = useRef(null);
	const [open, setOpen] = useState(false);

	const popoverClasses = usePopoverStyles();
	const selectClasses = useSelectStyles();
	const inputClasses = useInputClasses();

	return (
		<div className={cx('video-controls', { show: showControls })} {...props}>
			<Grid container direction="column" className="bottom-section">
				<Grid item container direction="row">
					<Progress />
				</Grid>
				<Grid
					container
					item
					direction="row"
					justify="flex-start"
					alignItems="center"
					{...props}
				>
					<Grid item>
						<Tooltip title={`${isPlaying ? 'Pause' : 'Play'} (k)`} placement="top">
							<Icon component={ended ? Replay : (isPlaying ? Pause : PlayArrow)} onClick={onClick} />
						</Tooltip>
					</Grid>
					<VolumeControls />
					<TimeDisplay />
					<Grid item className="right-side-icons">
						<Tooltip title="Settings" placement="top">
							<Icon
								id="settings-icon"
								ref={anchorEl}
								component={Settings}
								className={cx({ open })}
								onClick={() => {
									setOpen(!open);
								}}
							/>
						</Tooltip>
						<Popover
							classes={popoverClasses}
							open={open}
							anchorEl={anchorEl.current}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'center'
							}}
							transformOrigin={{
								horizontal: 'center',
								vertical: 'bottom'
							}}
							onClose={() => {
								setOpen(false)
							}}
						>
							<InputLabel classes={inputClasses} id="label">Playback speed</InputLabel>
							<Select classes={selectClasses} labelId="label" id="select" defaultValue="1">
								<MenuItem value="1">1x</MenuItem>
								<MenuItem value="2">2x</MenuItem>
							</Select>
						</Popover>

					</Grid>
					<Grid item>
						<Tooltip title="Full screen (f)" placement="top">
							<Icon component={isFullscreen ? FullscreenExit : Fullscreen} onClick={toggleFullscreen} />
						</Tooltip>
					</Grid>
				</Grid>
			</Grid>
		</div >
	);
});

export default VideoControls;
