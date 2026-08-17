<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait QueryHelper
{
    protected array $allowedFields    = [];
    protected array $allowedRelations = [];
    protected array $allowedFilters   = [];
    protected array $allowedSortFields = []; // separate allowed fields for sorting
    protected array $allowedOperators = [
        '$eq'          => '=',
        '$ne'          => '!=',
        '$gt'          => '>',
        '$gte'         => '>=',
        '$lt'          => '<',
        '$lte'         => '<=',
        '$contains'    => 'LIKE',
        '$notContains' => 'NOT LIKE',
    ];

    protected function getSelectedFields(Request $request): array
    {
        $fields = $request->input('fields', []);
        if (!empty($fields)) {
            $fields = array_filter($fields, fn($field) => in_array($field, $this->allowedFields));
            $fields = array_values($fields);
        }
        return !empty($fields) ? $fields : ['*'];
    }

    protected function getPopulate(Request $request): array
    {
        $populate = $request->input('populate', []);

        if ($populate === '*') {
            return $this->allowedRelations;
        }

        if (is_string($populate)) {
            $populate = [$populate];
        }

        return array_values(
            array_filter($populate, fn($relation) => in_array($relation, $this->allowedRelations))
        );
    }

    protected function applyFilters($query, Request $request): mixed
    {
        $filters = $request->input('filters', []);

        foreach ($filters as $field => $operators) {
            if (!in_array($field, $this->allowedFilters)) continue;

            foreach ($operators as $operator => $value) {
                if (!isset($this->allowedOperators[$operator])) continue;

                $sqlOperator = $this->allowedOperators[$operator];

                if ($sqlOperator === 'LIKE' || $sqlOperator === 'NOT LIKE') {
                    $query->where($field, $sqlOperator, "%{$value}%");
                } else {
                    $query->where($field, $sqlOperator, $value);
                }
            }
        }

        return $query;
    }

    protected function applySort($query, Request $request): mixed
    {
        // use $allowedSortFields if defined, otherwise fall back to $allowedFields
        $sortableFields = !empty($this->allowedSortFields)
            ? $this->allowedSortFields
            : $this->allowedFields;

        if (!$request->has('sort')) {
            return $query->latest(); // default: order by created_at desc
        }

        // support multiple sorts: ?sort=name:asc,price:desc
        $sortParams = explode(',', $request->input('sort'));

        foreach ($sortParams as $sortParam) {
            $parts     = explode(':', trim($sortParam));
            $field     = $parts[0] ?? null;
            $direction = $parts[1] ?? 'asc';

            if (!$field) continue;

            // validate direction
            $direction = in_array(strtolower($direction), ['asc', 'desc'])
                ? strtolower($direction)
                : 'asc';

            // validate field
            if (empty($sortableFields) || in_array($field, $sortableFields)) {
                $query->orderBy($field, $direction);
            }
        }

        return $query;
    }
}