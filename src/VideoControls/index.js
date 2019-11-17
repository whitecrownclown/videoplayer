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

import { PLAYBACK_RATES } from '../constants';

const usePopoverStyles = makeStyles({
	root: { color: '#fff' },
	paper: { padding: 6, background: 'rgba(97, 97, 97, 0.9)' }
});

const useMenuStyles = makeStyles({
	paper: { padding: 4, background: 'rgba(97, 97, 97, 0.9)' },
	list: { color: '#fff' }
})

const useSelectStyles = makeStyles({
	root: { width: '100% !important', color: '#fff' },
	select: { width: 'inherit' }
});

const VideoControls = observer(props => {
	const { showControls, isPlaying, isFullscreen, onClick, toggleFullscreen, ended, playbackRate, setPlaybackRate } = useStore();
	const anchorEl = useRef(null);
	const [open, setOpen] = useState(false);

	const popoverClasses = usePopoverStyles();
	const selectClasses = useSelectStyles();
	const menuClasses = useMenuStyles();

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
						<Tooltip
							placement="top"
							title="Playback rate"
						>
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
							<Select
								onChange={(e) => { setPlaybackRate(e.target.value); }}
								onClose={() => setOpen(false)}
								autoWidth={true}
								classes={selectClasses}
								labelId="label"
								id="select"
								defaultValue={playbackRate}
								MenuProps={{
									classes: menuClasses
								}}
								style={{
									margin: '0 auto'
								}}
							>
								{PLAYBACK_RATES.map((rate) =>
									<MenuItem key={rate} value={rate}>{rate}</MenuItem>
								)}
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
