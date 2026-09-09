"use client";
import { useState, useRef, useEffect, useId, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function GooeyFilter({
  filterId,
  blur
}) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({
  layoutId
}) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="w-4 h-4 shrink-0">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring",
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export function GooeyInput({
  placeholder = "Type to search...",
  className,
  classNames,
  collapsedWidth = 120,
  expandedWidth = 320,
  expandedOffset = 48,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onChange,
  onValueChange,
  onOpenChange,
  disabled = false,
  onSubmit,
  inputRef: externalInputRef
}) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const internalInputRef = useRef(null);
  const inputRef = externalInputRef || internalInputRef;
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback((next) => {
    if (!isControlled) {
      setUncontrolledValue(next);
    }
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const setExpanded = useCallback((next) => {
    setIsExpanded(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText, inputRef]);

  const buttonVariants = useMemo(() => ({
    collapsed: { width: collapsedWidth, marginLeft: 0 },
    expanded: { width: expandedWidth, marginLeft: expandedOffset },
  }), [collapsedWidth, expandedWidth, expandedOffset]);

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleBubbleClick = useCallback((e) => {
    e.stopPropagation();
    if (!disabled) {
      if (!isExpanded) {
        setExpanded(true);
      } else if (searchText && searchText.trim() && onSubmit) {
        onSubmit(searchText);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [disabled, isExpanded, searchText, onSubmit, setExpanded, inputRef]);

  const handleChange = useCallback((e) => {
    setSearchText(e.target.value);
    onChange?.(e);
  }, [setSearchText, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(searchText);
    }
  }, [onSubmit, searchText]);

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const surfaceClass =
    "bg-ink text-paper border border-gold/40 shadow-luxury";

  return (
    <div
      className={cn("relative flex items-center justify-center py-2", className, classNames?.root)}>
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />
      <div
        className={cn("relative flex h-10 items-center justify-center", classNames?.filterWrap)}
        style={{ filter: `url(#${filterId})` }}>
        <motion.div
          className={cn("flex h-10 items-center justify-center", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}>
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
              surfaceClass,
              classNames?.trigger
            )}>
            {!isExpanded ? (
              <SearchIcon layoutId={iconLayoutId} />
            ) : null}
            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-sm text-paper outline-none font-display",
                isExpanded
                  ? "placeholder:text-paper/60"
                  : "pointer-events-none placeholder:text-paper/80",
                classNames?.input
              )} />
          </button>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleBubbleClick}
          aria-label="Submit search"
          className={cn(
            "absolute inset-y-0 left-0 my-auto flex w-10 h-10 items-center justify-center transform-gpu cursor-pointer outline-none",
            classNames?.bubble
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}>
          <div
            className={cn(
              "flex w-10 h-10 items-center justify-center rounded-full hover:scale-105 transition-transform",
              surfaceClass,
              classNames?.bubbleSurface
            )}>
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.button>
      </div>
    </div>
  );

}


export function GooeyInputDemo() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <GooeyInput placeholder="Search..." />
    </div>
  );
}
