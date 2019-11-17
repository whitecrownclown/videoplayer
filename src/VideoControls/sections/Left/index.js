import React from 'react';
import { observer } from 'mobx-react';
import { Grid, Icon, Tooltip } from '@material-ui/core';
import { Pause, PlayArrow, Replay } from '@material-ui/icons';

import { useStore } from '../../../store';
import VolumeControls from '../../components/VolumeControls';
import TimeDisplay from '../../components/TimeDisplay';

const Left = observer(() => {
    const { isPlaying, ended, onClick } = useStore();

    return (
        <>
            <Grid item>
                <Tooltip title={`${ended ? 'Replay' : isPlaying ? 'Pause' : 'Play'} (k)`} placement="top">
                    <Icon component={ended ? Replay : (isPlaying ? Pause : PlayArrow)} onClick={onClick} />
                </Tooltip>
            </Grid>
            <VolumeControls />
            <TimeDisplay />
        </>
    );
});

export default Left;