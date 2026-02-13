import React, { useReducer } from 'react';
import { Analytics } from '@vercel/analytics/react';
import TranslatorPanel from './components/TranslatorPanel';

type State = {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_SOURCE_TEXT'; payload: string }
  | { type: 'SET_TARGET_TEXT'; payload: string }
  | { type: 'SET_SOURCE_LANG'; payload: string }
  | { type: 'SET_TARGET_LANG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SWAP_LANGS' };

const initialState: State = {
  sourceText: '',
  targetText: '',
  sourceLang: '',
  targetLang: 'ES',
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SOURCE_TEXT':
      return { ...state, sourceText: action.payload };
    case 'SET_TARGET_TEXT':
      return { ...state, targetText: action.payload };
    case 'SET_SOURCE_LANG':
      return { ...state, sourceLang: action.payload };
    case 'SET_TARGET_LANG':
      return { ...state, targetLang: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SWAP_LANGS':
      return {
        ...state,
        sourceLang: state.targetLang,
        targetLang: state.sourceLang,
        sourceText: state.targetText,
        targetText: state.sourceText,
      };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <div className="app-container">
        <div className="translator-layout">
          <TranslatorPanel
            mode="source"
            text={state.sourceText}
            lang={state.sourceLang}
            onTextChange={(text) => dispatch({ type: 'SET_SOURCE_TEXT', payload: text })}
            onLangChange={(lang) => dispatch({ type: 'SET_SOURCE_LANG', payload: lang })}
            isLoading={false}
            languages={[]}
          />
          <TranslatorPanel
            mode="target"
            text={state.targetText}
            lang={state.targetLang}
            onLangChange={(lang) => dispatch({ type: 'SET_TARGET_LANG', payload: lang })}
            isLoading={state.isLoading}
            languages={[]}
          />
        </div>
        {state.error && <div className="error-message">{state.error}</div>}
      </div>
      <Analytics />
    </>
  );
}
