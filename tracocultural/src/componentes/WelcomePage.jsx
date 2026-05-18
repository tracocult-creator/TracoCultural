import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './WelcomePage.module.css'

const WelcomePage = () => {
  const { user } = useAuth()

  if (user) return <Navigate to="/home" replace />

  return (
    <div className={styles.welcomePage}>
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeTitle}>Para onde nós vamos hoje?</h1>
        <p className={styles.welcomeSubtitle}>— Traço Cultural —</p>
        <div className={styles.welcomeButtons}>
          <Link to="/logar" className={styles.btnPrimary}>Entrar</Link>
          <Link to="/cadastrar" className={styles.btnSecondary}>Cadastrar</Link>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
