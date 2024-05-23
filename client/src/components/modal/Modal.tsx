import { classNames } from 'src/helpers/classNames';
import styles from './Modal.module.scss';
import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useState, useRef } from 'react';
import Portal from 'src/helpers/portal';
import { IoMdClose } from 'react-icons/io';

//in ms
const ANIMATION_DELAY = 300;

interface ModalProps extends PropsWithChildren{
  className? : string,
  isOpen : boolean,
  onClose? : () => void;
  title : string;
}

export default function Modal({ className, children, isOpen, onClose, title } : ModalProps) {
	const [isClosing, setIsClosing] = useState<boolean>(false);
	const timerRef = useRef<ReturnType<typeof setTimeout>>();
	const portalContainer = document.getElementById('portal-root');

	const closeHandler = useCallback(function (){
		if(onClose){
			setIsClosing(true);
			timerRef.current = setTimeout(() => {
				onClose();
				setIsClosing(false);
			}, ANIMATION_DELAY);
		}
	},[onClose]);

	const onKeyDown = useCallback(function (e :KeyboardEvent){
		if(e.key === 'Escape'){
			closeHandler();
		}
	},[closeHandler]);

	function contentHandleClick(e : React.MouseEvent){
		e.stopPropagation();
	}

	useEffect(() => {
		if(isOpen){
			window.addEventListener('keydown',onKeyDown);
		}

		return () => {
			clearTimeout(timerRef.current);
			window.removeEventListener('keydown', onKeyDown);
		};
	},[isOpen, onKeyDown]);

	const mods = {
		[styles.opened] : isOpen,
		[styles.closing] : isClosing,
	};

	return (
		<Portal element={portalContainer}>
			<div className={classNames(styles.Modal, mods , [])}>
				<div className={styles.overlay} onClick={closeHandler}>
					<div className={classNames(styles.content, {} ,[className])} onClick={contentHandleClick}>
						<header>
							<span>{title}</span>
							<IoMdClose onClick={closeHandler} className={styles.closeBtn}/>
						</header>
						{children}
					</div>
				</div>
			</div>
		</Portal>
	);
}