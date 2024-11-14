import React from "react";

import styles from './App.module.css'
import { Chart } from './components';


const App: React.FC = () => (
    <div className={styles.container} style={{display: 'flex'}}>
        <Chart />

    </div>
);

export default App;
