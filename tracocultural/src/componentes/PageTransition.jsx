import { motion } from 'framer-motion'

const variants = {
  initial: { x: '100%', opacity: 1 },
  animate: { x: 0,      opacity: 1 },
  exit:    { x: '-100%', opacity: 1 },
}

const PageTransition = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.35, ease: 'easeInOut' }}
    style={{ width: '100%', overflow: 'hidden' }}
  >
    {children}
  </motion.div>
)

export default PageTransition
