import { motion } from "framer-motion";
const Transition = ( props )=> {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.75}}>
      {props.children }
    </motion.div>
  );
}

export default Transition;