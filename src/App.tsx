import React from "react";
import Chart from './components/Chart/Chart';
import styles from './App.module.css'

const App: React.FC = () => (
    <div className={styles.container}>
        <h2>Tree Chart Example</h2>
        <Chart />
    </div>
);

export default App;
