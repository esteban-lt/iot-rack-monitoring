import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_router.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';
import 'package:rack_monitoring/features/devices/view_models/devices_view_model.dart';
import 'package:rack_monitoring/features/devices/views/widgets/node_card.dart';
import 'package:rack_monitoring/shared/widgets/message_state.dart';

class DevicesScreen extends ConsumerStatefulWidget {
  const DevicesScreen({super.key});

  @override
  ConsumerState<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends ConsumerState<DevicesScreen> {
  final _searchController = SearchController();
  NodeFilter? _filter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dispositivos'), actions: const [UserMenuButton()]),
      body: switch (ref.watch(nodeSummariesProvider)) {
        AsyncData(:final value) => _buildList(value),
        AsyncError() => MessageState(
          icon: Icons.cloud_off,
          title: 'No se pudieron cargar los dispositivos',
          description: 'Revisa tu conexión e inténtalo de nuevo.',
          action: FilledButton.tonal(
            onPressed: () => ref.invalidate(nodeSummariesProvider),
            child: const Text('Reintentar'),
          ),
        ),
        AsyncLoading() => const Center(child: CircularProgressIndicator()),
      },
    );
  }

  Widget _buildList(List<NodeSummary> nodes) {
    final theme = Theme.of(context);
    final visible = filterNodes(nodes, search: _searchController.text, filter: _filter);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: SearchBar(
            controller: _searchController,
            hintText: 'Buscar por nombre, MAC o IP',
            leading: const Icon(Icons.search),
            elevation: const WidgetStatePropertyAll(0),
            onChanged: (_) => setState(() {}),
            trailing: [
              if (_searchController.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Borrar búsqueda',
                  onPressed: () => setState(_searchController.clear),
                ),
            ],
          ),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            spacing: 8,
            children: [
              for (final filter in [null, ...NodeFilter.values])
                FilterChip(
                  label: Text(filter?.label ?? 'Todos'),
                  selected: _filter == filter,
                  onSelected: (_) => setState(() => _filter = filter),
                ),
            ],
          ),
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text('${visible.length} de ${nodes.length} dispositivos', style: theme.textTheme.bodySmall),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.refresh(nodeSummariesProvider.future),
            child: visible.isEmpty
                // Scrollable so pull to refresh also works on the empty state
                ? LayoutBuilder(
                    builder: (context, constraints) => SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: SizedBox(
                        height: constraints.maxHeight,
                        child: MessageState(
                          icon: Icons.memory,
                          title: 'No hay dispositivos para mostrar',
                          description: _filter == NodeFilter.unassigned
                              ? 'Todos los nodos tienen un rack asignado.'
                              : 'Prueba con otra búsqueda o con otro filtro.',
                        ),
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: visible.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final node = visible[index];
                      return NodeCard(
                        node,
                        onTap: switch (node.rackId) {
                          final rackId? => () => context.go(AppRoutes.rackDetail(rackId)),
                          null => null,
                        },
                      );
                    },
                  ),
          ),
        ),
      ],
    );
  }
}
