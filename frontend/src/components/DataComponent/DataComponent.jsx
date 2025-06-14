import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const DataComponent = ({ triplet }) => {
    const {
        predicate,
        predicateNsPrefix,
        object,
        objectNsPrefix,
        error,
        errorMsg
    } = triplet;

    return (
        <TableRow
            sx={{
                backgroundColor: error ? '#ffe6e6' : 'inherit'
            }}
        >
            <TableCell>{predicateNsPrefix}</TableCell>
            <TableCell>{predicate}</TableCell>
            <TableCell>{objectNsPrefix || ''}</TableCell>
            <TableCell>{object}</TableCell>
        </TableRow>
    );
};

export default DataComponent;
