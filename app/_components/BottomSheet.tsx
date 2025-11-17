"use client";

import { motion, useDragControls } from "framer-motion";
import { ReactNode, useRef } from "react";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
}: BottomSheetProps) {
  const controls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        ref={sheetRef}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120) onOpenChange(false);
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white"
      >
        <div
          className="flex w-full justify-center py-3"
          onPointerDown={(e) => controls.start(e)}
        >
          <div className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="px-4 pb-6">{children}</div>
      </motion.div>
    </div>
  );
}

// "use client";

// import { AnimatePresence, motion, useDragControls } from "framer-motion";
// import { ReactNode, useRef } from "react";

// interface BottomSheetProps {
//   open: boolean;
//   onOpenChange: (value: boolean) => void;
//   children: ReactNode;
// }

// export function BottomSheet({
//   open,
//   onOpenChange,
//   children,
// }: BottomSheetProps) {
//   const controls = useDragControls();
//   const sheetRef = useRef<HTMLDivElement>(null);

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-end bg-black/40"
//           onClick={() => onOpenChange(false)}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             ref={sheetRef}
//             drag="y"
//             dragControls={controls}
//             dragListener={false}
//             dragConstraints={{ top: 0, bottom: 0 }}
//             onDragEnd={(_, info) => {
//               if (info.offset.y > 120) onOpenChange(false);
//             }}
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             onClick={(e) => e.stopPropagation()}
//             className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white"
//           >
//             <div
//               className="flex w-full justify-center py-3"
//               onPointerDown={(e) => controls.start(e)}
//             >
//               <div className="h-1.5 w-10 rounded-full bg-gray-300" />
//             </div>

//             <div className="px-4 pb-6">{children}</div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// "use client";

// import { AnimatePresence, motion, useDragControls } from "framer-motion";
// import { ReactNode, useRef } from "react";

// interface BottomSheetProps {
//   open: boolean;
//   onOpenChange: (value: boolean) => void;
//   children: ReactNode;
// }

// export function BottomSheet({
//   open,
//   onOpenChange,
//   children,
// }: BottomSheetProps) {
//   const controls = useDragControls();
//   const sheetRef = useRef<HTMLDivElement>(null);

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-end bg-black/40"
//           onClick={() => onOpenChange(false)}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <motion.div
//             ref={sheetRef}
//             drag="y"
//             dragControls={controls}
//             dragListener={false}
//             dragConstraints={{ top: 0, bottom: 0 }}
//             onDragEnd={(_, info) => {
//               if (info.offset.y > 120) onOpenChange(false);
//             }}
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             onClick={(e) => e.stopPropagation()}
//             className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white"
//           >
//             <div
//               className="flex w-full justify-center py-3"
//               onPointerDown={(e) => controls.start(e)}
//             >
//               <div className="h-1.5 w-10 rounded-full bg-gray-300" />
//             </div>

//             <div className="px-4 pb-6">{children}</div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
