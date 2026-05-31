import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useGameStore } from './stores/gameStore'
import { playMusic, setMusicVolume, MUSIC_ASSET_PATH } from './audio/music'

const pinia = createPinia()
const app = createApp(App).use(pinia)
const gameStore = useGameStore(pinia)

try { setMusicVolume(gameStore.musicVolume); } catch (e) {}

// Start background music on first user gesture (click/key) to satisfy autoplay rules
const startMusicOnce = () => {
	try { playMusic(MUSIC_ASSET_PATH, gameStore.musicVolume); } catch (e) {}
};

window.addEventListener('pointerdown', startMusicOnce, { once: true });
window.addEventListener('keydown', startMusicOnce, { once: true });

app.mount('#app')


