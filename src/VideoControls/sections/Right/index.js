import React, { useRef, useState } from 'react';
import cx from 'classnames';
import { observer } from 'mobx-react';
import { Grid, Tooltip, Icon, Select, MenuItem, Popover } from '@material-ui/core';
import { Fullscreen, FullscreenExit, Settings } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import { useStore } from '../../../store';
import { PLAYBACK_RATES } from '../../../constants';

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

const Right = observer(() => {
    const { isFullscreen, videoEl, toggleFullscreen, playbackRate, setPlaybackRate } = useStore();
    const anchorEl = useRef(null);
    const [open, setOpen] = useState(false);

    const popoverClasses = usePopoverStyles();
    const selectClasses = useSelectStyles();
    const menuClasses = useMenuStyles();

    return (
        <>
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
                    container={isFullscreen ? videoEl.current.parentNode : document.body}
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
                            classes: menuClasses,
                            container: isFullscreen ? videoEl.current.parentNode : document.body
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
        </>
    )
});

export default Right;