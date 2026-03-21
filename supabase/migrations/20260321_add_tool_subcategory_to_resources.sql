alter table public.resources
add column if not exists tool_subcategory text
check (tool_subcategory in ('Dev tool', 'UX tool'));

create index if not exists resources_tool_subcategory_idx
on public.resources (tool_subcategory)
where tool_subcategory is not null;
