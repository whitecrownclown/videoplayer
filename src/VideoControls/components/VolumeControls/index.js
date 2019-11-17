import React, { useCallback, useState } from 'react';
import { observer, } from 'mobx-react';
import cx from 'classnames';
import { Icon, Slider, Grid } from '@material-ui/core';
import { VolumeUp, VolumeDown, VolumeMute } from '@material-ui/icons';
import './style.css';

import { useStore } from '../../../store';

function getVolumeIcon(volume, muted) {
	if (muted || volume === 0) {
		return VolumeMute;
	}

	if (volume < 1 && volume > 0) {
		return VolumeDown;
	}

	return VolumeUp;
}

const VolumeControls = observer(() => {
	const { volume, setVolume, muted, setMuted } = useStore();

	const [volumeValue, setVolumeValue] = useState(volume);
	const [isOpen, setIsOpen] = useState(false);

	const handleChange = useCallback((e, newValue) => {
		if (Number.isNaN(newValue)) return;
		setVolumeValue(newValue);
		setVolume(newValue / 100);
	}, [setVolume]);

	return (
		<Grid
			item
			onMouseEnter={() => {
				setIsOpen(true);
			}}
			onMouseLeave={() => {
				setIsOpen(false);
			}}
		>
			<Icon component={getVolumeIcon(volume, muted)} onClick={() => setMuted(!muted)} />
			<div className={cx('volume-slider', { open: isOpen })}>
				<Slider min={0} max={100} value={muted ? 0 : volumeValue} onChange={handleChange} />
			</div>
		</Grid>
	);
});

export default VolumeControls;
