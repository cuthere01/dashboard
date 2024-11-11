import React from "react";
import Chart from './components/Chart/Chart';
import styles from './App.module.css'

const App: React.FC = () => (
    <div className={styles.container}>
        <Chart />
    </div>
);

export default App;
