import React from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import './app.css';
import poster from './media/poster.jpg'

import { StoreProvider } from './store';
import { VideoPlayerView } from './VideoPlayer';

const theme = createMuiTheme({
	palette: {
		primary: red
	}
});

function App() {
	return (
		<div className="App">
			<StoreProvider>
				<ThemeProvider theme={theme}>
					<VideoPlayerView
						src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
						poster={poster}
						controls={false}
					/>
				</ThemeProvider>
			</StoreProvider>
		</div>
	);
}

export default App;
