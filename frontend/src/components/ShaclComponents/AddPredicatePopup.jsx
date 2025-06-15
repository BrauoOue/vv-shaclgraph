import React from 'react';
import "./AddPredicatePopup.css"

const AddPredicatePopup = ({nullablePredicates, setAddPredicatePopupShow}) =>
{
    return (
        <div className={"addPredicatePopup"}>
           <h1>Add Predicate</h1>
           <select>
               {nullablePredicates.map(predicate =>
                   <option key={predicate} value={predicate}>{predicate}</option>
               )}
           </select>
            <button>Add</button>
            <button onClick={()=>setAddPredicatePopupShow(false)}>Close</button>
        </div>
    );
};

export default AddPredicatePopup;